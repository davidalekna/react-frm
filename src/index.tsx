import * as React from 'react';
import { isEqual, merge, cloneDeep } from 'lodash';
import { createObject, isBoolean } from './utils/helpers';
import {
  IField,
  FormState,
  FormActions,
  InputEvent,
  ICustomInput,
  IFinalValues,
  IDefaultProps,
  IFrmContext,
} from './types';

const FrmContext = React.createContext<IFrmContext>({
  fields: [],
  handleSubmit: () => {},
  onChange: () => {},
  onBlur: () => {},
  clearValues: () => {},
  addFields: () => {},
});

const errorPusher = (field: IField) => {
  if (field.requirements) {
    field.errors = [];
    for (const fn of field.requirements) {
      const error = fn(field.value);
      if (error && !field.errors.includes(error)) {
        field.errors.push(error);
      }
    }
  }
  return field;
};

const extractFinalValues = (state: FormState): IFinalValues => {
  return state.reduce((acc, field) => {
    if ((field.value && !isBoolean(field.value)) || isBoolean(field.value)) {
      return merge(acc, createObject({ [field.name]: field.value }));
    }
    return acc;
  }, {});
};

const defaultFieldValidation = (
  state: FormState,
  dispatch: Function,
): [{ [key: string]: unknown }, FormState] | void => {
  const stateWithErrors = [...state].map(errorPusher);
  dispatch({ type: '@@errors', payload: stateWithErrors });
  const errors = stateWithErrors.map(field => field.errors || []);
  // .flat() doesnt work for typescript...
  if (errors.concat.apply([], errors).filter(Boolean).length > 0) {
    return;
  } else {
    return [extractFinalValues(stateWithErrors), stateWithErrors];
  }
};

const getFromStateByName = (state: FormState) => (itemName: string) => {
  let itemIndex: number = 0;
  const item = state.find(({ name }, index) => {
    itemIndex = index;
    return name === itemName;
  });
  if (!item) {
    throw Error(`input name ${itemName} doesnt exist on provided fields`);
  }
  return {
    item,
    index: itemIndex,
  };
};

const findDuplicates = (state: FormState) => (stateToMerge: FormState) => {
  return stateToMerge.filter(field => {
    const duplicate = state.map(f => f.name).includes(field.name);
    if (duplicate) {
      console.error(`Duplicate field name ${field.name} extracted.`);
    }
    return !duplicate;
  });
};

const reducer = (initialState: FormState) => (
  state: FormState,
  action: FormActions,
): FormState => {
  const findByName = getFromStateByName(state);
  const removeDuplicates = findDuplicates(state);
  switch (action.type) {
    case '@@fieldUpdate': {
      const { item, index } = findByName(action.payload.name);
      state[index] = Object.assign(item, action.payload);
      return cloneDeep(state);
    }
    case '@@fieldError': {
      const { item, index } = findByName(action.payload);
      const updatedItem = errorPusher({ ...item });
      state[index] = Object.assign(item, updatedItem);
      return cloneDeep(state);
    }
    case '@@addFields': {
      return cloneDeep([...state, ...removeDuplicates(action.payload)]);
    }
    case '@@errors': {
      return cloneDeep(action.payload);
    }
    case '@@reset': {
      return cloneDeep(initialState);
    }
    default: {
      return state;
    }
  }
};

export default function useFormFields({
  initialFields = [],
  validate = defaultFieldValidation,
  onSubmit = () => {},
}: IDefaultProps): [FormState, { [key: string]: Function }] {
  const [state, dispatch] = React.useReducer(
    reducer(initialFields),
    cloneDeep(initialFields),
  );

  const onChangeTarget = ({ target }: InputEvent) => {
    if (!target.name) throw Error('no input name');
    dispatch({
      type: '@@fieldUpdate',
      payload: {
        name: target.name,
        value: target.type === 'checkbox' ? target.checked : target.value,
      },
    });
  };

  const onChangeCustom = ({ name, value }: ICustomInput) => {
    if (!name) throw Error('no input name');
    dispatch({
      type: '@@fieldUpdate',
      payload: {
        name,
        value,
      },
    });
  };

  const onChange = (input: InputEvent | ICustomInput) => {
    if ('target' in input) {
      onChangeTarget(input);
    } else {
      onChangeCustom(input);
    }
  };

  const onBlur = (input: InputEvent | ICustomInput) => {
    if ('target' in input) {
      const { target } = input;
      if (!target.name) throw Error('no input name');
      dispatch({ type: '@@fieldError', payload: target.name });
    } else {
      const { name } = input;
      if (!name) throw Error('no input name');
      dispatch({ type: '@@fieldError', payload: name });
    }
  };

  const handleSubmit = (evt: InputEvent) => {
    evt.preventDefault();
    const values = validate(state, dispatch);
    if (Array.isArray(values)) {
      onSubmit(values);
    }
  };

  const clearValues = () => {
    dispatch({ type: '@@reset' });
  };

  const addFields = (fields: FormState) => {
    dispatch({ type: '@@addFields', payload: fields });
  };

  return [state, { handleSubmit, onChange, onBlur, clearValues, addFields }];
}

export const FieldContainer = React.memo(
  ({ children, render, ...props }: any) => {
    if (render) return render(props);
    return children(props);
  },
  (
    { value: prevValue, errors: prevErrors = [] },
    { value: nextValue, errors: nextErrors = [] },
  ) => isEqual([prevValue, prevErrors], [nextValue, nextErrors]),
);

// render props ->

export const Form = ({ children, ...props }) => {
  const [fields, fns] = useFormFields(props);
  const ui =
    typeof children === 'function' ? children({ fields, ...fns }) : children;

  return (
    <FrmContext.Provider value={{ fields, ...fns }}>{ui}</FrmContext.Provider>
  );
};

// TODO: FieldContainer and Fields could be one component
// need to check if context exist or not and do
// appropriate render
export const Fields = React.memo(
  ({ children, render, ...props }: IField) => {
    const { onChange, onBlur } = React.useContext(FrmContext);
    if (children && render) {
      throw Error('children and render cannot be used together!');
    }
    if (render) return render({ onChange, onBlur, ...props });
    return children({ onChange, onBlur, ...props });
  },
  (
    { value: prevValue, errors: prevErrors = [] },
    { value: nextValue, errors: nextErrors = [] },
  ) => isEqual([prevValue, prevErrors], [nextValue, nextErrors]),
);

export const Field = ({
  children,
  render,
  name,
}: {
  children: Function;
  render: Function;
  name: string;
}) => {
  const { fields, onChange, onBlur } = React.useContext(FrmContext);
  const field = fields.find((f: IField) => f.name === name);

  if (children && render)
    throw Error('children and render cannot be used together!');
  if (!field) {
    throw Error(`Field with name ${name} doesn\`t exist on initialFields`);
  }

  return React.useMemo(() => {
    if (render) {
      return render({ onChange, onBlur, ...field });
    }
    return children({ onChange, onBlur, ...field });
  }, [field.value, field.errors]);
};

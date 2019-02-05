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

// TODO: async validation
const asyncErrorPusher = async (field: IField) => {
  if (Array.isArray(field.requirements)) {
    field.errors = [];
    await Promise.all(
      field.requirements.map(async fn => {
        const error = await fn(field.value);
        if (error && field.errors && !field.errors.includes(error)) {
          field.errors.push(error);
        }
      }),
    );
  }
  return field;
};

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
  if (errors.flat().filter(Boolean).length > 0) {
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
      // should add error under meta?
      state[index] = Object.assign(item, updatedItem);
      return cloneDeep(state);
    }
    case '@@fieldTouched': {
      const { item, index } = findByName(action.payload);
      state[index] = merge(item, { meta: { touched: true } });
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
}: IDefaultProps): [FormState, { [key: string]: any }] {
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

  const onFocus = (input: InputEvent | ICustomInput) => {
    if ('target' in input) {
      const { target } = input;
      if (!target.name) throw Error('no input name');
      dispatch({ type: '@@fieldTouched', payload: target.name });
    } else {
      const { name } = input;
      if (!name) throw Error('no input name');
      dispatch({ type: '@@fieldTouched', payload: name });
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

  const touched = () =>
    state.find(f => f.meta && f.meta.touched) ? true : false;

  const addFields = (fields: FormState) => {
    dispatch({ type: '@@addFields', payload: fields });
  };

  return [
    state,
    {
      handleSubmit,
      onChange,
      onBlur,
      onFocus,
      clearValues,
      touched: touched(),
      addFields,
    },
  ];
}

/**
 * render props option
 */
export const Form = ({ children, ...props }) => {
  const [fields, fns] = useFormFields(props);
  const ui =
    typeof children === 'function' ? children({ fields, ...fns }) : children;

  return (
    <FrmContext.Provider value={{ fields, ...fns }}>{ui}</FrmContext.Provider>
  );
};

/**
 * Useful when rendering fields from a map. Works with and without context.
 */
export const FieldContainer = React.memo(
  // remove unused props from the dom
  ({ children, render, requirements, ...props }: IField) => {
    const { onChange, onBlur, onFocus } = React.useContext(FrmContext);
    if (children && render) {
      throw Error('children and render cannot be used together!');
    }
    if (render) return render({ onChange, onBlur, onFocus, ...props });
    return children({ onChange, onBlur, onFocus, ...props });
  },
  (
    { value: prevValue, errors: prevErrors = [] },
    { value: nextValue, errors: nextErrors = [] },
  ) => isEqual([prevValue, prevErrors], [nextValue, nextErrors]),
);

/**
 * If form has to have some shape, this component will select field by name
 */
export const Field = ({
  children,
  render,
  name,
}: {
  children?: Function;
  render?: Function;
  name: string;
}) => {
  const { fields, onChange, onBlur, onFocus } = React.useContext(FrmContext);
  const field = fields.find((f: IField) => f.name === name);

  if (children && render)
    throw Error('children and render cannot be used together!');
  if (!field) {
    const hasMatch = fields.find(f => f.name.includes(name));
    if (hasMatch) {
      throw Error(
        `Field with name ${name} doesn\`t exist, did you mean ${
          hasMatch.name
        }?`,
      );
    } else {
      throw Error(`Field with name ${name} doesn\`t exist.`);
    }
  }

  return React.useMemo(() => {
    // remove unused props from the dom
    const { requirements, ...fieldProps } = field;
    if (render) {
      return render({ onChange, onBlur, onFocus, ...fieldProps });
    }
    if (children) {
      return children({ onChange, onBlur, onFocus, ...fieldProps });
    }
  }, [field.value, field.errors]);
};

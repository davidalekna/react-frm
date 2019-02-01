import * as React from 'react';
import { isEqual, cloneDeep } from 'lodash';
import {
  IField,
  State,
  FormActions,
  InputEvent,
  ICustomInput,
  IFinalValues,
  IDefaultProps,
} from './types';

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

const extractFinalValues = (state: State): IFinalValues => {
  const isBoolean = (val: any) => typeof val === 'boolean';
  return state.reduce((acc, field) => {
    let fv = {};
    if (field.value && !isBoolean(field.value)) {
      fv = { [field.name]: field.value };
    }
    if (isBoolean(field.value)) {
      fv = { [field.name]: field.value };
    }
    return Object.assign(acc, fv);
  }, {});
};

const defaultFieldValidation = (state: State, dispatch: Function) => {
  const stateWithErrors = [...state].map(errorPusher);
  dispatch({ type: '@@errors', payload: stateWithErrors });
  const errors = stateWithErrors.map(field => field.errors || []);
  // .flat() doesnt work for typescript...
  if (errors.concat.apply([], errors).filter(Boolean).length > 0) {
    return [undefined];
  } else {
    return [extractFinalValues(stateWithErrors), stateWithErrors];
  }
};

const getFromStateByName = (state: State) => (itemName: string) => {
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

const findDuplicates = (state: State) => (stateToMerge: State) => {
  return stateToMerge.filter(field => {
    const duplicate = state.map(f => f.name).includes(field.name);
    if (duplicate) {
      console.error(`Duplicate field name ${field.name} extracted.`);
    }
    return !duplicate;
  });
};

const reducer = (initialState: State) => (
  state: State,
  action: FormActions,
): State => {
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
  initialFields,
  validate = defaultFieldValidation,
  onSubmit = () => {},
}: IDefaultProps): [State, { [key: string]: Function }] {
  const [state, dispatch] = React.useReducer(
    reducer(initialFields),
    cloneDeep(initialFields),
  );

  const handleChange = (input: InputEvent | ICustomInput) => {
    if ('target' in input) {
      const { target } = input;
      if (!target.name) throw Error('no input name');
      dispatch({
        type: '@@fieldUpdate',
        payload: {
          name: target.name,
          value: target.type === 'checkbox' ? target.checked : target.value,
        },
      });
    } else {
      const { name, value } = input;
      if (!name) throw Error('no input name');
      dispatch({
        type: '@@fieldUpdate',
        payload: {
          name,
          value,
        },
      });
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

  const handleSubmit = evt => {
    evt.preventDefault();
    onSubmit(validate(state, dispatch));
  };

  const clearValues = () => {
    dispatch({ type: '@@reset' });
  };

  const addFields = (fields: State) => {
    dispatch({ type: '@@addFields', payload: fields });
  };

  return [
    state,
    { handleChange, handleSubmit, onBlur, clearValues, addFields },
  ];
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

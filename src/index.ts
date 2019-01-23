import * as React from 'react';
import { isEqual, cloneDeep } from 'lodash';
import { Field, State, Action, InputEvent, FinalValues } from './types';

const errorPusher = (field: Field) => {
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

const extractFinalValues = (state: State): FinalValues => {
  const isBoolean = (val: any) => typeof val === 'boolean';
  return state.reduce((acc, field) => {
    let obj = {};
    if (field.value && !isBoolean(field.value)) {
      obj = { [field.name]: field.value };
    }
    if (isBoolean(field.value)) {
      obj = { [field.name]: field.value };
    }
    return Object.assign(acc, obj);
  }, {});
};

const defaultFieldValidation = (state: State, dispatch: Function) => {
  const stateWithErrors = [...state].map(errorPusher);
  dispatch({ type: '@@errors', payload: stateWithErrors });
  const errors = stateWithErrors.map(field => field.errors || []);
  // .flat() doesnt work for typescript...
  if (errors.concat.apply([], errors).filter(Boolean).length > 0) {
    alert('fix your errors please!');
    return;
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
      console.error(`Duplicate field name ${field.name} will be extracted.`);
    }
    return !duplicate;
  });
};

const reducer = (initialState: State) => (
  state: State,
  action: Action,
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

export default function useFormFields(
  initialState: State = [],
  validate: Function = defaultFieldValidation,
): [State, { [key: string]: Function }] {
  const [state, dispatch] = React.useReducer(
    reducer(initialState),
    cloneDeep(initialState),
  );

  const handleChange = ({ target }: InputEvent) => {
    if (!target.name) throw Error('no input name');
    dispatch({
      type: '@@fieldUpdate',
      payload: {
        name: target.name,
        value: target.type === 'checkbox' ? target.checked : target.value,
      },
    });
  };

  const validateOnBlur = ({ target }: InputEvent) => {
    if (!target.name) throw Error('no input name');
    dispatch({ type: '@@fieldError', payload: target.name });
  };

  const handleSubmit = () => {
    return validate(state, dispatch);
  };

  const clearValues = () => {
    dispatch({ type: '@@reset' });
  };

  const addFields = (fields: State) => {
    dispatch({ type: '@@addFields', payload: fields });
  };

  return [
    state,
    { handleChange, handleSubmit, validateOnBlur, clearValues, addFields },
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

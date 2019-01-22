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
  return state.reduce(
    (acc, field) => Object.assign(acc, { [field.name]: field.value }),
    {},
  );
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
    return extractFinalValues(stateWithErrors);
  }
};

const findByName = (state: State, itemName: string) => {
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

const reducer = (initialState: State) => (
  state: State,
  action: Action,
): State => {
  switch (action.type) {
    case '@@fieldUpdate': {
      const { item, index } = findByName(state, action.payload.name);
      state[index] = Object.assign(item, action.payload);
      return cloneDeep(state);
    }
    case '@@fieldError': {
      const { item, index } = findByName(state, action.payload);
      const updatedItem = errorPusher({ ...item });
      state[index] = Object.assign(item, updatedItem);
      return cloneDeep(state);
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

  return [state, { handleChange, handleSubmit, validateOnBlur, clearValues }];
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

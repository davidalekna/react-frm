import * as React from 'react';
import { cloneDeep } from 'lodash';

export interface Requirement {
  ([any]: any): string | void | null;
}

export interface Field {
  name: string;
  value: any;
  type: string;
  errors?: Array<string>;
  label?: string;
  placeholder?: string;
  requirements?: Array<Requirement>;
  component?: Function;
  [key: string]: any;
}

export type State = Array<Field>;

export interface Action {
  type: string;
  payload?: Field | any;
}

export type InputEvent = React.ChangeEvent<HTMLInputElement>;

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

const defaultFieldValidation = (
  state: State,
  dispatch: Function,
): State | void => {
  const stateWithErrors = [...state].map(errorPusher);
  dispatch({ type: '@@errors', payload: stateWithErrors });
  const errors = stateWithErrors.map(field => field.errors || []);
  // .flat() doesnt work for typescript...
  if (errors.concat.apply([], errors).filter(Boolean).length > 0) {
    alert('fix your errors please!');
    return;
  } else {
    return stateWithErrors;
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
) {
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

  const clearValues = () => {
    dispatch({ type: '@@reset' });
  };

  const handleSubmit = () => {
    return validate(state, dispatch);
  };

  return [state, handleChange, handleSubmit, validateOnBlur, clearValues];
}

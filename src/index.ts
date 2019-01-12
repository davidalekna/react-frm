import * as React from 'react';
import cloneDeep from 'lodash.clonedeep';

export interface Field {
  name: string;
  errors?: Array<string>;
  label?: string;
  value: string;
  placeholder?: string;
  type: string;
  requirements?: Array<Function>;
  component?: Function;
}

export interface State extends Array<Field> {}

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

const defaultFieldValidation = (state: State, dispatch: Function) => {
  const validatedState = [...state].map(errorPusher);
  dispatch({ type: 'pushErrors', payload: validatedState });
  // if any errors return undefined, otherwise state
  if (
    validatedState
      .map(field => field.errors)
      .flat()
      .filter(Boolean).length > 0
  ) {
    alert('fix your errors please!');
    return undefined;
  } else {
    return validatedState;
  }
};

const reducer = (initialState: State) => (state: State, action: Action) => {
  switch (action.type) {
    case 'fieldUpdate': {
      let itemIndex: number = 0;
      const item = state.find(({ name }, index) => {
        itemIndex = index;
        return name === action.payload.name;
      });
      state[itemIndex] = Object.assign(item, action.payload);
      return cloneDeep(state);
    }
    case 'pushErrors': {
      return cloneDeep(action.payload);
    }
    case 'resetFields': {
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

  const handleChange = ({ target }: InputEvent): void => {
    if (!target.name) throw Error('no input name');
    dispatch({
      type: 'fieldUpdate',
      payload: {
        name: target.name,
        value: target.type === 'checkbox' ? target.checked : target.value,
      },
    });
  };

  const validateOnBlur = ({ target }: InputEvent): void => {
    if (!target.name) throw Error('no input name');
    const item: Field = state.find(item => item.name === target.name);
    const updatedItem = errorPusher(item);
    dispatch({ type: 'fieldUpdate', payload: updatedItem });
  };

  const clearValues = () => {
    dispatch({ type: 'resetFields' });
  };

  const handleSubmit = () => {
    return validate(state, dispatch);
  };

  return [state, handleChange, handleSubmit, validateOnBlur, clearValues];
}

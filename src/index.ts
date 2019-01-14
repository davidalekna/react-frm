import * as React from 'react';
import { cloneDeep } from 'lodash';

export interface Requirement {
  ([any]: any): string | undefined | null;
}

export interface Field {
  name: string;
  errors?: Array<string>;
  label?: string;
  value: string;
  placeholder?: string;
  type: string;
  requirements?: Array<Requirement>;
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
  const stateWithErrors = [...state].map(errorPusher);
  dispatch({ type: '@@errors', payload: stateWithErrors });
  const errors: any = stateWithErrors.map(field => field.errors || []);
  if (errors.flat().filter(Boolean).length > 0) {
    alert('fix your errors please!');
    return undefined;
  } else {
    return stateWithErrors;
  }
};

const reducer = (initialState: State) => (state: State, action: Action) => {
  switch (action.type) {
    case '@@fieldUpdate': {
      let itemIndex: number = 0;
      const item = state.find(({ name }, index) => {
        itemIndex = index;
        return name === action.payload.name;
      });
      state[itemIndex] = Object.assign(item, action.payload);
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
    const item: any = state.find(item => item.name === target.name);
    const updatedItem = errorPusher({ ...item });
    dispatch({ type: '@@fieldUpdate', payload: updatedItem });
  };

  const clearValues = () => {
    dispatch({ type: '@@reset' });
  };

  const handleSubmit = (): State | void => {
    return validate(state, dispatch);
  };

  return [state, handleChange, handleSubmit, validateOnBlur, clearValues];
}

import * as React from 'react';
import cloneDeep from 'lodash.clonedeep';

const errorPusher = field => {
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

const defaultFieldValidation = (state, updateState) => {
  const validatedState = [...state].map(errorPusher);
  updateState({ type: 'pushErrors', payload: validatedState });
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

export default function useFormFields(
  initialValues = [],
  validate = defaultFieldValidation,
) {
  const [state, dispatch] = React.useReducer((state, action) => {
    switch (action.type) {
      case 'fieldUpdate': {
        let itemIndex;
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
        return cloneDeep(initialValues);
      }
      default: {
        return state;
      }
    }
  }, cloneDeep(initialValues));

  const handleChange = ({ target }) => {
    if (!target.name) throw Error('no input name');
    dispatch({
      type: 'fieldUpdate',
      payload: {
        name: target.name,
        value: target.type === 'checkbox' ? target.checked : target.value,
      },
    });
  };

  const validateOnBlur = ({ target }) => {
    if (!target.name) throw Error('no input name');
    const item = state.find(item => item.name === target.name);
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

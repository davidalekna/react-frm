import * as React from 'react';
import { isEqual, merge, cloneDeep } from 'lodash';
import { createObject, isBoolean } from './utils/helpers';
import {
  IField,
  FormState,
  InputEvent,
  ICustomInput,
  IFinalValues,
  IDefaultProps,
  IFrmContext,
} from './types';
import useObservable, { getFromStateByName } from './useObservable';
import { fieldUpdate } from './store/actions';

const FrmContext = React.createContext<IFrmContext>({
  fields: [],
  handleSubmit: () => {},
  onChange: () => {},
  onBlur: () => {},
  clearValues: () => {},
  addFields: () => {},
});

export const errorPusher = (field: IField) => {
  if (field.requirements) {
    field.errors = [];

    // todo: figure out how to useObservable... Might have to switch
    // to useState instead of useReducer?

    // const sub = field.requirements.pipe(
    //   mergeMap(q =>
    //     forkJoin(...q.map(fn => from(Promise.resolve(fn(field.value))))),
    //   ),
    // );

    // sub.subscribe({
    //   next: value => {
    //     console.log('errorPusher', value);
    //     field.errors = value;
    //   },
    // });

    field.meta.loading = false;
  }
  return field;
};

export const extractFinalValues = (state: FormState): IFinalValues => {
  return state.reduce((acc, field) => {
    if ((field.value && !isBoolean(field.value)) || isBoolean(field.value)) {
      return merge(acc, createObject({ [field.name]: field.value }));
    }
    return acc;
  }, {});
};

export const defaultFieldValidation = (
  state: FormState,
  dispatch: Function,
): [IFinalValues, FormState] | void => {
  const stateWithErrors = [...state].map(errorPusher);
  dispatch({ type: '@@frm/ERRORS', payload: stateWithErrors });
  const errors = stateWithErrors.map(field => field.errors || []);
  if (errors.flat().filter(Boolean).length > 0) {
    return;
  } else {
    return [extractFinalValues(stateWithErrors), stateWithErrors];
  }
};

export function Form({
  children,
  initialFields = [],
  onSubmit = () => {},
}: IDefaultProps) {
  const initialValue: FormState = cloneDeep(
    initialFields.map((fld: IField) => ({
      ...fld,
      meta: { touched: false, loading: false },
    })),
  );

  const { state, dispatch } = useObservable(cloneDeep(initialValue));

  const onChangeTarget = ({ target }: InputEvent) => {
    if (!target.name) throw Error('no input name');
    dispatch(
      fieldUpdate({
        name: target.name,
        value: target.type === 'checkbox' ? target.checked : target.value,
      }),
    );
  };

  const onChangeCustom = ({ name, value }: ICustomInput) => {
    if (!name) throw Error('no input name');
    dispatch({
      type: '@@frm/UPDATE',
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

  const onBlurAction = (name: string, findByName: Function) => {
    if (!name) throw Error('no input name');
    const { index, item } = findByName(name);
    dispatch({
      type: '@@frm/FIELD_BLUR',
      payload: { index, item },
    });
  };

  const onBlur = (input: InputEvent | ICustomInput) => {
    const findByName = getFromStateByName(state);
    if ('target' in input) {
      const { target } = input;
      onBlurAction(target.name, findByName);
    } else {
      const { name } = input;
      onBlurAction(name, findByName);
    }
  };

  const onFocus = (input: InputEvent | ICustomInput) => {
    // todo: cancel Promise
    if ('target' in input) {
      const { target } = input;
      if (!target.name) throw Error('no input name');
      dispatch({ type: '@@frm/TOUCHED', payload: { name: target.name } });
    } else {
      const { name } = input;
      if (!name) throw Error('no input name');
      dispatch({ type: '@@frm/TOUCHED', payload: { name } });
    }
  };

  const handleSubmit = (evt: InputEvent) => {
    // TODO: cancel Promise
    // TODO: should dispatch an action which will validate all the fields
    // and then return the values
    evt.preventDefault();
    const values = defaultFieldValidation(state, dispatch);
    if (Array.isArray(values)) {
      onSubmit(values);
    }
  };

  const clearValues = () => {
    dispatch({ type: '@@frm/RESET' });
  };

  const touched = () => {
    // state.find(({ meta }: { meta: any }) => meta && meta.touched)
    //   ? true
    //   : false;
  };

  // RENDERER BELLOW

  const fns = {
    handleSubmit,
    onChange,
    onBlur,
    onFocus,
    clearValues,
    touched: touched(),
  };

  const ui =
    typeof children === 'function'
      ? children({ fields: state, ...fns })
      : children;

  return React.useMemo(() => {
    return (
      <FrmContext.Provider value={{ fields: state, ...fns }}>
        {ui}
      </FrmContext.Provider>
    );
    // todo: some optimization
  }, [state]);
}

export function useFormContext() {
  const context = React.useContext(FrmContext);
  if (!context) {
    throw new Error(
      `Form compound components cannot be rendered outside the Form component`,
    );
  }
  return context;
}

/**
 * Useful when rendering fields from a map. Works with and without context.
 */
export const FieldContainer = React.memo(
  // remove unused props from the dom
  ({ children, render, requirements, ...props }: IField) => {
    const { onChange, onBlur, onFocus } = useFormContext();
    const passProps = { onChange, onBlur, onFocus, ...props };
    if (children && render) {
      throw Error('children and render cannot be used together!');
    }
    if (render) return render(passProps);
    return children(passProps);
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
  const { fields, onChange, onBlur, onFocus } = useFormContext();
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
    const passProps = { onChange, onBlur, onFocus, ...fieldProps };
    if (render) return render(passProps);
    if (children) return children(passProps);
  }, [field.value, field.errors]);
};

import * as React from 'react';
import { forkJoin, of, from } from 'rxjs';
import { find, map } from 'rxjs/operators';
import { isEqual, merge, cloneDeep } from 'lodash';
import { createObject, isBoolean } from './utils/helpers';
import useObservable, { createState } from './useObservable';
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
  dispatch({ type: '@@errors', payload: stateWithErrors });
  const errors = stateWithErrors.map(field => field.errors || []);
  if (errors.flat().filter(Boolean).length > 0) {
    return;
  } else {
    return [extractFinalValues(stateWithErrors), stateWithErrors];
  }
};

export const getFromStateByName = (state: FormState) => (itemName: string) => {
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

const reducer = (initialState: FormState) => (
  state: FormState,
  action: FormActions,
): FormState => {
  const findByName = getFromStateByName(state);
  switch (action.type) {
    case '@@fieldUpdate': {
      const { item, index } = findByName(action.payload.name);

      // Cancel request if sent from errorPusher()
      // const s: any = state[index].requirements;

      state[index] = Object.assign(item, { ...action.payload, errors: [] });
      return cloneDeep(state);
    }
    case '@@fieldError': {
      // should add error under meta?
      const { index, item } = action.payload;
      state[index] = item;
      return cloneDeep(state);
    }
    case '@@fieldTouched': {
      const { name, loading } = action.payload;
      const { item, index } = findByName(name);
      state[index] = merge(item, {
        meta: { touched: true, loading },
      });
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

export function Form({
  children,
  initialFields = [],
  validate = defaultFieldValidation,
  onSubmit = () => {},
}: IDefaultProps) {
  const fields: FormState = cloneDeep(
    initialFields.map((fld: IField) => ({
      ...fld,
      meta: { touched: false, loading: false },
    })),
  );

  // const [state, dispatch] = React.useReducer(
  //   reducer(fields),
  //   cloneDeep(fields),
  // );

  const dispatch: any = () => {};

  // Rxjs state

  const disp = createState('reducers', of(fields));
  const state = useObservable(disp, fields);

  // Rxjs state

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

  const onBlurAction = (name: string, findByName: Function) => {
    if (!name) throw Error('no input name');
    const { index, item } = findByName(name);

    disp.pipe().subscribe({
      next(value) {
        console.log(value);
      },
    });

    // const updatedItem = errorPusher({ ...item });
    // dispatch({
    //   type: '@@fieldError',
    //   payload: { index, item: updatedItem },
    // });
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
      dispatch({ type: '@@fieldTouched', payload: { name: target.name } });
    } else {
      const { name } = input;
      if (!name) throw Error('no input name');
      dispatch({ type: '@@fieldTouched', payload: { name } });
    }
  };

  const handleSubmit = (evt: InputEvent) => {
    // todo: cancel Promise
    evt.preventDefault();
    const values = validate(state, dispatch);
    if (Array.isArray(values)) {
      onSubmit(values);
    }
  };

  const clearValues = () => {
    dispatch({ type: '@@reset' });
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

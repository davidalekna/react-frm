import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { scan, filter, tap } from 'rxjs/operators';
import { merge, cloneDeep } from 'lodash';
import { FormState, FormActions } from './types';

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
    case '@@frm/UPDATE': {
      const { item, index } = findByName(action.payload.name);

      // Cancel request if sent from errorPusher()
      // const s: any = state[index].requirements;

      state[index] = Object.assign(item, { ...action.payload, errors: [] });
      return cloneDeep(state);
    }
    case '@@frm/ERROR': {
      // should add error under meta?
      const { index, item } = action.payload;
      state[index] = item;
      return cloneDeep(state);
    }
    case '@@frm/TOUCHED': {
      const { name, loading } = action.payload;
      const { item, index } = findByName(name);
      state[index] = merge(item, {
        meta: { touched: true, loading },
      });
      return cloneDeep(state);
    }
    case '@@frm/ERRORS': {
      return cloneDeep(action.payload);
    }
    case '@@frm/RESET': {
      return cloneDeep(initialState);
    }
    default: {
      return state;
    }
  }
};

const actions$ = new Subject();

const useObservable = initialState => {
  const [state, update] = useState(initialState);

  const dispatch = (update: Object) => actions$.next(update);

  useEffect(() => {
    const s = actions$
      .pipe(
        tap(asd => console.log(asd)),
        scan(reducer(initialState), initialState),
      )
      .subscribe(update);

    return () => s.unsubscribe();
  }, [actions$]);

  return { state, dispatch };
};

export default useObservable;

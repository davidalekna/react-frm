import { useEffect, useState } from 'react';
import { Subject, merge } from 'rxjs';
import { scan } from 'rxjs/operators';
import { merge as lodashMerge, cloneDeep } from 'lodash';
import { FormState } from './types';
import { fieldBlurEpic, fieldEpic } from './epics';

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

const reducer = (initialState: FormState) => (state: any, action: any): any => {
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
    case '@@frm/FIELD_BLUR': {
      const { index, item } = action.payload;
      state[index] = item;
      return cloneDeep(state);
    }
    case '@@frm/TOUCHED': {
      const { name, loading } = action.payload;
      const { item, index } = findByName(name);
      state[index] = lodashMerge(item, {
        meta: { touched: true, loading },
      });
      return cloneDeep(state);
    }
    case '@@frm/FIELD_ERROR_UPDATE': {
      const { index, item } = action.payload;
      state[index] = item;
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

const action$ = new Subject();

const useObservable = (initialState: FormState) => {
  const [state, update] = useState(initialState);

  const dispatch = (update: Object) => action$.next(update);

  useEffect(() => {
    const s = merge(fieldBlurEpic(action$), fieldEpic(action$))
      .pipe(scan(reducer(initialState), initialState))
      .subscribe(update);

    return () => s.unsubscribe();
  }, [action$]);

  return { state, dispatch };
};

export default useObservable;

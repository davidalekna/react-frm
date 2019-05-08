import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';
import { merge as lodashMerge, cloneDeep } from 'lodash';
import { FormState } from './types';
import { combineEpics, fieldBlurEpic } from './store/epics';
import { FormActions } from './store/types';
import {
  UPDATE,
  FIELD_BLUR,
  FIELD_ERROR_UPDATE,
  ERROR,
  TOUCHED,
  ERRORS,
  RESET,
} from './store/actions';

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
    case UPDATE: {
      const { item, index } = findByName(action.payload.name);

      // Cancel request if sent from errorPusher()
      // const s: any = state[index].requirements;

      state[index] = Object.assign(item, { ...action.payload, errors: [] });
      return cloneDeep(state);
    }
    case ERROR: {
      // should add error under meta?
      const { index, item } = action.payload;
      state[index] = item;
      return cloneDeep(state);
    }
    case FIELD_BLUR: {
      const { index, item } = action.payload;
      state[index] = item;
      return cloneDeep(state);
    }
    case TOUCHED: {
      const { name, loading } = action.payload;
      const { item, index } = findByName(name);
      state[index] = lodashMerge(item, {
        meta: { touched: true, loading },
      });
      return cloneDeep(state);
    }
    case FIELD_ERROR_UPDATE: {
      const { index, item } = action.payload;
      state[index] = item;
      return cloneDeep(state);
    }
    case ERRORS: {
      return cloneDeep(action.payload);
    }
    case RESET: {
      return cloneDeep(initialState);
    }
    default: {
      return state;
    }
  }
};

const action$ = new Subject();

const useObservable = (
  initialState: FormState,
  outsideEpics: Function[] = [],
) => {
  const [state, update] = useState(initialState);

  const combinedEpics = combineEpics(fieldBlurEpic, ...outsideEpics);

  const dispatch = (update: Object) => action$.next(update);

  useEffect(() => {
    const s = combinedEpics(action$)
      .pipe(scan<any>(reducer(initialState), initialState))
      .subscribe(update);

    return () => s.unsubscribe();
  }, [action$]);

  return { state, dispatch };
};

export default useObservable;

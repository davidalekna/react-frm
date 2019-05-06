import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';
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

const reducer = (state: FormState, action: FormActions): FormState => {
  const findByName = getFromStateByName(state);
  console.log(action);
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
    // case '@@reset': {
    //   return cloneDeep(initialState);
    // }
    default: {
      return state;
    }
  }
};

const actions$ = new Subject();

const useObservable = initialState => {
  const [state, update] = useState(initialState);

  useEffect(() => {
    const s = actions$.pipe(scan(reducer, initialState)).subscribe(update);
    return () => s.unsubscribe();
  }, [actions$]);

  const dispatch = (update: Object) => {
    actions$.next(update);
  };

  return { state, dispatch };
};

export default useObservable;

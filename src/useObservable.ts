import { useEffect, useState } from 'react';
import { Subject, of, forkJoin, race, merge } from 'rxjs';
import {
  scan,
  filter,
  switchMap,
  map,
  mergeMap,
  mapTo,
  distinctUntilChanged,
  debounceTime,
  tap,
  concat,
  combineLatest,
  concatMap,
} from 'rxjs/operators';
import { merge as lodashMerge, cloneDeep } from 'lodash';
import { FormState, FormActions, IField } from './types';

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

function fieldBlurEpic(action2$) {
  return action2$.pipe(
    tap(() => {
      console.log('we are here');
    }),
    filter(({ type }) => type === '@@frm/FIELD_BLUR'),
    mergeMap((action: any) => {
      return of(action).pipe(
        filter(
          ({ payload }) =>
            Array.isArray(payload.item.requirements) &&
            payload.item.requirements.length,
        ),
        debounceTime(3000),
        switchMap(({ payload }) => {
          const requests = payload.item.requirements
            .map(fn => Promise.resolve(fn(payload.item.value)))
            .filter(Boolean);

          // TODO: use generators so requests could come back one after another.
          // At the moment forkJoin will wait until all Promise resolves
          // something like from(function* generator() { ... })
          // or https://github.com/btroncone/learn-rxjs/blob/master/operators/transformation/scan.md
          // mergeMap can accumulate http responses over time

          // like Promise.all will fire on all request and wait until all resolves.
          const ajax$ = forkJoin(requests).pipe(
            map(resp => {
              return {
                type: '@@frm/FIELD_ERROR_UPDATE',
                payload: Object.assign(payload, {
                  item: {
                    ...payload.item,
                    errors: resp.filter(Boolean),
                  },
                }),
              };
            }),
          );

          // cancel validation requests
          const blocker$ = action2$
            // ERROR: further code cancel request even on another field update
            // so need to find a solution to cancel only on same field update
            .pipe(filter(({ type }: any) => type === '@@frm/UPDATE'))
            .pipe(mapTo({ type: 'cancel-request' }));

          return race(ajax$, blocker$);
        }),
      );
    }),
  );
}

const action$ = new Subject();

const useObservable = (initialState: FormState) => {
  const [state, update] = useState(initialState);

  const dispatch = (update: Object) => action$.next(update);

  useEffect(() => {
    const s = action$
      .pipe()
      .pipe(
        // I want to provide full Subject here, not just current action
        fieldBlurEpic(action$),
        scan(reducer(initialState), initialState),
        distinctUntilChanged(),
      )
      .subscribe(update);

    return () => s.unsubscribe();
  }, [action$]);

  return { state, dispatch };
};

export default useObservable;

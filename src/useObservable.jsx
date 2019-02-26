import { useState, useEffect } from 'react';
import { Subject, of } from 'rxjs';
import { merge, scan } from 'rxjs/operators';

export function createAction() {
  return new Subject();
}

export function createActions(actionNames) {
  return actionNames.reduce(
    (akk, name) => ({ ...akk, [name]: createAction() }),
    {},
  );
}

// this fn be passed to useObservable as observable$
export function createState(reducer$, initialState$ = of({})) {
  const merged = initialState$.pipe(merge(reducer$));

  console.log(merged);
  return merged;

  // return merge(initialState$, reducer$)
  //   .scan((state, [scope, reducer]) => ({
  //     ...state,
  //     [scope]: reducer(state[scope]),
  //   }))
  //   .publishReplay(1)
  //   .refCount();

  // return initialState$
  //   .merge(reducer$)
  //   .scan((state, [scope, reducer]) => ({
  //     ...state,
  //     [scope]: reducer(state[scope]),
  //   }))
  //   .publishReplay(1)
  //   .refCount();
}

export default function useObservable(observable$, initialValue) {
  const [state, setState] = useState(initialValue);

  useEffect(() => {
    const s = observable$.subscribe(setState);
    return () => s.unsubscribe();
  }, [observable$]);

  return state;
}

import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';
import { FormState } from './types';
import { combineEpics, fieldBlurEpic } from './store/epics';
import reducer from './store/reducer';

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

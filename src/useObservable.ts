import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { scan } from 'rxjs/operators';
import { FormState } from './types';
import {
  combineEpics,
  fieldBlurEpic,
  validateAllFieldsEpic,
} from './store/epics';
import formReducer from './store/reducer';

const action$ = new Subject();

const useObservable = (
  initialState: FormState,
  outsideEpics: Function[] = [],
) => {
  const [state, update] = useState(initialState);

  const combinedEpics = combineEpics(
    fieldBlurEpic,
    validateAllFieldsEpic,
    ...outsideEpics,
  );

  const dispatch = (next: Object) => action$.next(next);

  // fields effect
  useEffect(() => {
    const s = combinedEpics(action$)
      .pipe(scan<any>(formReducer(initialState), initialState))
      .subscribe(update);

    return () => s.unsubscribe();
  }, [action$]);

  return { state, dispatch };
};

export default useObservable;

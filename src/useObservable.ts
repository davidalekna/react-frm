import { useEffect, useState } from 'react';
import { Subject } from 'rxjs';
import { scan, filter } from 'rxjs/operators';
import { FormState } from './types';
import {
  combineEpics,
  fieldBlurEpic,
  validateAllFieldsEpic,
} from './store/epics';
import formReducer from './store/reducer';
// import { VALIDATE_ALL_FIELDS } from './store/actions';
// import useSetState from './useSetState';

const action$ = new Subject();

const useObservable = (
  initialState: FormState,
  outsideEpics: Function[] = [],
) => {
  const [state, update] = useState(initialState);
  // const [final, setFinal] = useSetState({
  //   touched: false,
  //   valid: false,
  // });

  const combinedEpics = combineEpics(
    fieldBlurEpic,
    validateAllFieldsEpic,
    ...outsideEpics,
  );

  const dispatch = (update: Object) => action$.next(update);

  // fields effect
  useEffect(() => {
    const s = combinedEpics(action$)
      .pipe(scan<any>(formReducer(initialState), initialState))
      .subscribe(update);

    return () => s.unsubscribe();
  }, [action$]);

  // final values effect
  // useEffect(() => {
  //   const s = action$
  //     .pipe(filter(({ type }: any) => type === VALIDATE_ALL_FIELDS))
  //     .subscribe(setFinal);
  //   return () => s.unsubscribe();
  // }, [action$]);

  return { state, dispatch };
};

export default useObservable;

import { of, merge } from 'rxjs';
import { map } from 'rxjs/operators';
import formActions from './actions';

// MERGE api has changed :(
// const FormReducer2$ = of(() => initialState)
//   .merge(
//     formActions.increment.map(payload => state => state + payload),
//     formActions.decrement.map(payload => state => state - payload),
//     formActions.reset.map(_payload => _state => initialState),
//   );

const FormReducer$ = initialState => {
  return merge(
    of(() => initialState),
    formActions.fieldUpdate.next(payload => state => state),
    formActions.fieldError.next(payload => state => state),
    formActions.fieldTouched.next(payload => state => state),
    formActions.errors.next(payload => state => state),
    formActions.reset.next(payload => state => state),
  );
};

export default function reducers(initialState) {
  return FormReducer$(initialState);
}

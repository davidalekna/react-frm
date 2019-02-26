import { of, merge } from 'rxjs';
import formActions from './actions';

const initialState = [];

// const FormReducer2$ = of(() => initialState)
//   .merge(
//     formActions.increment.map(payload => state => state + payload),
//     formActions.decrement.map(payload => state => state - payload),
//     formActions.reset.map(_payload => _state => initialState),
//   );

const FormReducer$ = merge(
  of(() => initialState).pipe(
    formActions.fieldUpdate.map(payload => state => state),
    formActions.fieldError.map(payload => state => state),
    formActions.fieldTouched.map(payload => state => state),
    formActions.errors.map(payload => state => state),
    formActions.reset.map(payload => state => state),
  ),
);

export default FormReducer$;

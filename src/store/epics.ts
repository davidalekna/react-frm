import { of, merge, race, from, forkJoin } from 'rxjs';
import { FIELD_BLUR, UPDATE, VALIDATE_ALL_FIELDS, FORM_RESET } from './actions';
import { fieldErrorUpdate } from './actions';
import {
  filter,
  switchMap,
  mergeMap,
  mapTo,
  mergeAll,
  scan,
  map,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { FormActions } from './types';
import { FormState, IField } from '../types';

export function ofType(actionType: string) {
  return filter(({ type }: FormActions) => type === actionType);
}

export function fieldBlurEpic(action$) {
  return action$.pipe(
    ofType(FIELD_BLUR),
    // debounceTime(1500), stops sync functions from running
    mergeMap((action: any) => {
      return of(action).pipe(
        filter(
          ({ payload }) =>
            Array.isArray(payload.item.requirements) &&
            payload.item.requirements.length,
        ),
        switchMap(({ payload }) => {
          // add requests into an Observable from
          const requests = payload.item.requirements
            .map(fn => from(Promise.resolve(fn(payload.item.value))))
            .filter(Boolean);

          // ERROR: continues until it finisheds. How to stop scan?

          // error$ stream generates errors over time and applies to field errors
          // TODO: dispatch loading state on field
          return of(...requests).pipe(
            // TODO: loading state on a field
            mergeAll(),
            scan((allResponses: any, currentResponse) => {
              return [...allResponses, currentResponse];
            }, []),
            mergeMap(errors =>
              of(
                fieldErrorUpdate({
                  ...payload,
                  item: {
                    ...payload.item,
                    errors: errors.filter(Boolean),
                  },
                }),
              ),
            ),
            takeUntil(
              merge(
                action$.pipe(ofType(FORM_RESET)),
                action$.pipe(
                  ofType(UPDATE),
                  filter((innerAction: any) => {
                    return (
                      innerAction.payload.name === action.payload.item.name
                    );
                  }),
                ),
              ).pipe(mapTo({ type: 'cancel-request' })),
            ),
          );
        }),
      );
    }),
  );
}

export function validateAllFieldsEpic(action$) {
  return action$.pipe(
    ofType(VALIDATE_ALL_FIELDS),
    switchMap(({ payload }: { payload: FormState }) => {
      // TODO: race on forkJoin, no iterators here!

      const newState = from(payload.map(f => of(f))).pipe(
        mergeMap(field => {
          return field.pipe(
            filter((field: any) => {
              return (
                Array.isArray(field.requirements) && field.requirements.length
              );
            }),
            mergeMap((field: any) => {
              // add requests into an Observable from
              console.log(field);

              const requests = field.requirements
                .map(fn => from(Promise.resolve(fn(field.value))))
                .filter(Boolean);

              const error$ = forkJoin(...requests).pipe(
                map(errors => {
                  console.log(errors);
                  return of(
                    fieldErrorUpdate({
                      ...field,
                      item: {
                        ...field.item,
                        errors: errors.filter(Boolean),
                      },
                    }),
                  );
                }),
              );

              return error$;
            }),
          );
        }),
      );

      return newState;
    }),
  );
}

// COMBINE EPICS

export const combineEpics = (...epics) => {
  return action$ => {
    return merge(
      action$,
      ...epics.map(epic => {
        const output$ = epic(action$);
        if (!output$) {
          throw new TypeError(
            `combineEpics: one of the provided Epics "${epic.name ||
              '<anonymous>'}" does not return a stream. Double check you\'re not missing a return statement!`,
          );
        }
        return output$;
      }),
    );
  };
};

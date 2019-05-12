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
import { ofType } from './helpers';

const fieldValiator = action$ => {
  return switchMap(({ payload }) => {
    console.log(payload);
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
              return innerAction.payload.name === payload.item.name;
            }),
          ),
        ).pipe(mapTo({ type: 'cancel-request' })),
      ),
    );
  });
};

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
        // take from payload
        fieldValiator(action$),
      );
    }),
  );
}

export function validateAllFieldsEpic(action$) {
  return action$.pipe(
    ofType(VALIDATE_ALL_FIELDS),
    switchMap(({ payload }: { payload: FormState }) => {
      return from(payload.map((f, index) => of({ index, item: f }))).pipe(
        mergeMap(field => {
          return field.pipe(
            filter(({ item }: any) => {
              return (
                Array.isArray(item.requirements) && item.requirements.length
              );
            }),
            map(field => ({
              payload: field,
            })),
            fieldValiator(action$),
          );
        }),
      );
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

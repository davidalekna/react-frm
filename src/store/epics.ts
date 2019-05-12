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
  debounceTime,
  last,
} from 'rxjs/operators';
import { FormActions } from './types';
import { FormState, IField } from '../types';
import { ofType } from './helpers';

const fieldValidator = action$ => {
  return switchMap(({ payload }) => {
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
              meta: {
                ...payload.item.meta,
                loading: requests.length !== errors.length,
              },
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
        fieldValidator(action$),
      );
    }),
  );
}

export function validateAllFieldsEpic(action$) {
  return action$.pipe(
    ofType(VALIDATE_ALL_FIELDS),
    debounceTime(250),
    switchMap(({ payload }: { payload: FormState }) => {
      return from(
        payload.map((item: IField, index: number) => of({ index, item })),
      ).pipe(
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
            fieldValidator(action$),
          );
        }),
      );
    }),
  );
}

// COMBINE EPICS

export const combineEpics = (...epics) => {
  return (...streams) => {
    return merge(
      streams[0],
      ...epics.map(epic => {
        const output$ = epic(...streams);
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

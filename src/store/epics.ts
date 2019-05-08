import { of, race, merge, concat, from } from 'rxjs';
import {
  filter,
  switchMap,
  mergeMap,
  mapTo,
  mergeAll,
  scan,
} from 'rxjs/operators';

function ofType(actionType: string) {
  return filter(({ type }: any) => type === actionType);
}

export function fieldBlurEpic(action$) {
  return action$.pipe(
    ofType('@@frm/FIELD_BLUR'),
    // debounceTime(1500), stops sync functions from running
    mergeMap((action: any) => {
      return of(action).pipe(
        filter(
          ({ payload }) =>
            Array.isArray(payload.item.requirements) &&
            payload.item.requirements.length,
        ),
        switchMap(({ payload }) => {
          const requests = payload.item.requirements
            .map(fn => from(Promise.resolve(fn(payload.item.value))))
            .filter(Boolean);

          // TODO: loading state on a field

          // generator generates errors over time and applies to field error
          const error$ = of(...requests).pipe(
            mergeAll(),
            scan((allResponses: any, currentResponse) => {
              return [...allResponses, currentResponse];
            }, []),
            mergeMap(errors =>
              of({
                type: '@@frm/FIELD_ERROR_UPDATE',
                payload: Object.assign(payload, {
                  item: {
                    ...payload.item,
                    errors: errors.filter(Boolean),
                  },
                }),
              }),
            ),
          );

          // cancel validation requests
          const blocker$ = action$
            // cancel request only if same field was edited
            // before promise completes
            .pipe(
              ofType('@@frm/UPDATE'),
              filter((act: any) => {
                return act.payload.name === action.payload.item.name;
              }),
            )
            .pipe(mapTo({ type: 'cancel-request' }));

          // TODO: dispatch loading state on field
          return concat(race(error$, blocker$));
        }),
      );
    }),
  );
}

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

import { of, race, merge, concat, from } from 'rxjs';
import { FIELD_BLUR, FIELD_ERROR_UPDATE, UPDATE } from './actions';
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

          // error$ stream generates errors over time and applies to field errors
          const error$ = of(...requests).pipe(
            // TODO: loading state on a field
            mergeAll(),
            scan((allResponses: any, currentResponse) => {
              return [...allResponses, currentResponse];
            }, []),
            mergeMap(errors =>
              of({
                type: FIELD_ERROR_UPDATE,
                payload: Object.assign(payload, {
                  item: {
                    ...payload.item,
                    errors: errors.filter(Boolean),
                  },
                }),
              }),
            ),
          );

          // cancel request if same field that fired them was edited
          const blocker$ = action$
            .pipe(
              ofType(UPDATE),
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

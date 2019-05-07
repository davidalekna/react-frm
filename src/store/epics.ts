import { of, forkJoin, race, merge, concat } from 'rxjs';
import { filter, switchMap, map, mergeMap, mapTo, tap } from 'rxjs/operators';

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
            .map(fn => Promise.resolve(fn(payload.item.value)))
            .filter(Boolean);

          // TODO: use generators so requests could come back one after another.
          // At the moment forkJoin will wait until all Promise resolves
          // something like from(function* generator() { ... })
          // or https://github.com/btroncone/learn-rxjs/blob/master/operators/transformation/scan.md
          // mergeMap can accumulate http responses over time

          // like Promise.all will fire on all request and wait until all resolves.
          const ajax$ = forkJoin(requests).pipe(
            map(resp => {
              return {
                type: '@@frm/FIELD_ERROR_UPDATE',
                payload: Object.assign(payload, {
                  item: {
                    ...payload.item,
                    errors: resp.filter(Boolean),
                  },
                }),
              };
            }),
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
          return concat(race(ajax$, blocker$));
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

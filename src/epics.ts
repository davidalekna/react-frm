import { of, forkJoin, race, merge } from 'rxjs';
import {
  filter,
  switchMap,
  map,
  mergeMap,
  mapTo,
  debounceTime,
  tap,
} from 'rxjs/operators';

export function fieldBlurEpic(action$) {
  return action$.pipe(
    filter(({ type }) => type === '@@frm/FIELD_BLUR'),
    mergeMap((action: any) => {
      return of(action).pipe(
        filter(
          ({ payload }) =>
            Array.isArray(payload.item.requirements) &&
            payload.item.requirements.length,
        ),
        debounceTime(3000),
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
            // ERROR: further code cancel request even on another field update
            // so need to find a solution to cancel only on same field update
            .pipe(filter(({ type }: any) => type === '@@frm/UPDATE'))
            .pipe(mapTo({ type: 'cancel-request' }));

          return race(ajax$, blocker$);
        }),
      );
    }),
  );
}

export function fieldEpic(action$) {
  return action$.pipe(filter(({ type }) => type !== '@@frm/FIELD_BLUR'));
}

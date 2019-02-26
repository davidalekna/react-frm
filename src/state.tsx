import * as React from 'react';
import { of, Subject, merge } from 'rxjs';

export function createAction() {
  return new Subject();
}

export function createActions(actionNames) {
  return actionNames.reduce(
    (akk, name) => ({ ...akk, [name]: createAction() }),
    {},
  );
}

export function createState(reducer$, initialState$ = of({})) {
  return initialState$
    .merge(reducer$)
    .scan((state, [scope, reducer]) => ({
      ...state,
      [scope]: reducer(state[scope]),
    }))
    .publishReplay(1)
    .refCount();
}

export function connect(selector = state => state, actionSubjects) {
  const actions = Object.keys(actionSubjects).reduce(
    (akk: any, key) => ({
      ...akk,
      [key]: value => actionSubjects[key].next(value),
    }),
    {},
  );

  return function wrapWithConnect(WrappedComponent) {
    return class Connect extends React.Component {
      subscription: any = () => {};
      componentWillMount() {
        this.subscription = this.context.state$
          .map(selector)
          .subscribe(this.setState);
      }

      componentWillUnmount() {
        this.subscription.unsubscribe();
      }

      render() {
        return (
          <WrappedComponent {...this.state} {...this.props} {...actions} />
        );
      }
    };
  };
}

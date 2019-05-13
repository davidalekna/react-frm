import { filter } from 'rxjs/operators';
import { merge } from 'lodash';
import { FormActions } from './types';
import { FormState, IFinalValues, IField } from '../types';
import { createObject, isBoolean } from '../utils/helpers';

export function ofType(actionType: string) {
  return filter(({ type }: FormActions) => type === actionType);
}

export function containsNoErrors(fields: IField[]) {
  return (
    fields
      .map((field: any) => field.errors)
      .reduce((acc, val) => {
        return acc.concat(val);
      }, []).length === 0
  );
}

export function extractFinalValues(state: FormState): IFinalValues {
  return state.reduce((acc, field) => {
    if ((field.value && !isBoolean(field.value)) || isBoolean(field.value)) {
      return merge(acc, createObject({ [field.name]: field.value }));
    }
    return acc;
  }, {});
}

export function allErrorsEmitted(state: FormState, totalErrors: number) {
  return (
    state
      .filter(item => item.requirements)
      .reduce((acc: unknown[], val) => {
        return acc.concat(val.requirements);
      }, []).length === totalErrors
  );
}

import { filter } from 'rxjs/operators';
import { FormActions } from './types';

export function ofType(actionType: string) {
  return filter(({ type }: FormActions) => type === actionType);
}

export const UPDATE = '@@frm/UPDATE';
export const FIELD_BLUR = '@@frm/FIELD_BLUR';
export const FIELD_ERROR_UPDATE = '@@frm/FIELD_ERROR_UPDATE';
export const ERROR = '@@frm/ERROR';
export const TOUCHED = '@@frm/TOUCHED';
export const ERRORS = '@@frm/ERRORS';
export const RESET = '@@frm/RESET';

import { IField } from '../types';

export function fieldUpdate({
  name,
  value,
}: {
  name: string;
  value: string | number | boolean;
}) {
  return {
    type: UPDATE,
    payload: {
      name,
      value,
    },
  };
}

export function fieldBlur({ index, item }: { index: number; item: IField }) {
  return {
    type: FIELD_BLUR,
    payload: { index, item },
  };
}

// TODO: move all dispatch actions in here

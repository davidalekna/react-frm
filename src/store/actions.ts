export const UPDATE = '@@frm/UPDATE';
export const FIELD_BLUR = '@@frm/FIELD_BLUR';
export const FIELD_ERROR_UPDATE = '@@frm/FIELD_ERROR_UPDATE';
export const ERROR = '@@frm/ERROR';
export const TOUCHED = '@@frm/TOUCHED';
export const ERRORS = '@@frm/ERRORS';
export const RESET = '@@frm/RESET';

export function fieldUpdate({ name, value }) {
  return {
    type: UPDATE,
    payload: {
      name,
      value,
    },
  };
}

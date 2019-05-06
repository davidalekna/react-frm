import { Observable } from 'rxjs';

export interface IField {
  name: string;
  value: any;
  type: string;
  meta: {
    touched?: boolean;
    loading?: boolean;
  };
  errors?: any[];
  label?: string;
  placeholder?: string;
  requirements?: Observable<Function[]>;
  [key: string]: any;
}

export type FormState = { readonly [K in keyof IField]: IField[K] }[];

export type InputEvent = React.ChangeEvent<HTMLInputElement>;

export interface ICustomInput {
  name: string;
  value: string;
}

export interface IFinalValues {
  [key: string]: any;
}

export interface IDefaultProps {
  children: Function | unknown;
  initialFields?: any[];
  validate?: Function;
  onSubmit?: Function;
}

export interface IFrmContext {
  fields: FormState;
  [key: string]: any;
}

/**
 * reducer actions
 */
interface IAction {
  type: string;
}

class FieldUpdate implements IAction {
  readonly type = '@@frm/UPDATE';
  constructor(public payload: { name: string; value: unknown }) {}
}

class FieldError implements IAction {
  readonly type = '@@frm/ERROR';
  constructor(public payload: { index: number; item: IField }) {}
}

class FieldTouched implements IAction {
  readonly type = '@@frm/TOUCHED';
  constructor(public payload: { name: string; loading?: boolean }) {}
}

class Errors implements IAction {
  readonly type = '@@frm/ERRORS';
  constructor(public payload: FormState) {}
}

class Reset implements IAction {
  readonly type = '@@frm/RESET';
}

export type FormActions =
  | FieldUpdate
  | FieldError
  | FieldTouched
  | Errors
  | Reset;

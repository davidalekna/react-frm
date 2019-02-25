type Requirement = ([any]: any) => string | void | null;

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
  requirements?: Requirement[];
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
  readonly type = '@@fieldUpdate';
  constructor(public payload: { name: string; value: unknown }) {}
}

class FieldError implements IAction {
  readonly type = '@@fieldError';
  constructor(public payload: { index: number; item: IField }) {}
}

class FieldTouched implements IAction {
  readonly type = '@@fieldTouched';
  constructor(public payload: { name: string; loading?: boolean }) {}
}

class AddFields implements IAction {
  readonly type = '@@addFields';
  constructor(public payload: FormState) {}
}

class Errors implements IAction {
  readonly type = '@@errors';
  constructor(public payload: FormState) {}
}

class Reset implements IAction {
  readonly type = '@@reset';
}

export type FormActions =
  | FieldUpdate
  | FieldError
  | FieldTouched
  | AddFields
  | Errors
  | Reset;

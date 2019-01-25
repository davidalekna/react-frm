type Requirement = ([any]: any) => string | void | null;

export interface IField {
  name: string;
  value: any;
  type: string;
  errors?: Array<string>;
  label?: string;
  placeholder?: string;
  requirements?: Requirement[];
  [key: string]: any;
}

export type State = { readonly [K in keyof IField]: IField[K] }[];

export type InputEvent = React.ChangeEvent<HTMLInputElement>;

export interface ICustomInput {
  name: string;
  value: string;
}

export interface IFinalValues {
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
  constructor(public payload: string) {}
}

class AddFields implements IAction {
  readonly type = '@@addFields';
  constructor(public payload: State) {}
}

class Errors implements IAction {
  readonly type = '@@errors';
  constructor(public payload: State) {}
}

class Reset implements IAction {
  readonly type = '@@reset';
}

export type FormActions = FieldUpdate | FieldError | AddFields | Errors | Reset;

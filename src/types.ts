interface Requirement {
  ([any]: any): string | void | null;
}

export interface Field {
  name: string;
  value: any;
  type: string;
  errors?: Array<string>;
  label?: string;
  placeholder?: string;
  requirements?: Requirement[];
  [key: string]: any;
}

export type State = Field[];

export interface Action {
  type: string;
  payload?: Field | any;
}

export type InputEvent = React.ChangeEvent<HTMLInputElement>;

export interface FinalValues {
  [name: string]: any;
}

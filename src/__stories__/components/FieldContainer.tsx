import * as React from 'react';
import { isEqual } from 'lodash';

function renderFieldErrors(errors: string[]) {
  return (
    errors && (
      <ul>
        {errors.map((err, key) => (
          <li key={key} style={{ color: 'violet' }}>
            {err}
          </li>
        ))}
      </ul>
    )
  );
}

const FieldContainer = React.memo(
  ({ component: Field, ...props }: any) => {
    return (
      <label key={props.name}>
        <div>{props.label}</div>
        <Field
          name={props.name}
          type={props.type}
          value={props.value}
          placeholder={props.placeholder}
          checked={props.checked}
          onBlur={props.validateOnBlur}
          onChange={props.handleChange}
        />
        {renderFieldErrors(props.errors)}
      </label>
    );
  },
  (
    { value: prevValue, errors: prevErrors = [] },
    { value: nextValue, errors: nextErrors = [] },
  ) => isEqual([prevValue, prevErrors], [nextValue, nextErrors]),
);

export default FieldContainer;

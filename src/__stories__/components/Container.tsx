import * as React from 'react';

function FieldErrors({ errors = [] }: { errors: string[] }) {
  if (errors.length) {
    return (
      <ul>
        {errors.map((err, key) => (
          <li key={key} style={{ color: 'violet' }}>
            {err}
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

const Container = ({ component: Field, ...props }) => {
  return (
    <label key={props.name}>
      <div>{props.label}</div>
      <Field
        name={props.name}
        type={props.type}
        value={props.value}
        placeholder={props.placeholder}
        options={props.options}
        checked={props.checked}
        onBlur={props.validateOnBlur}
        onChange={props.handleChange}
      />
      <FieldErrors errors={...props.errors} />
    </label>
  );
};

export default Container;

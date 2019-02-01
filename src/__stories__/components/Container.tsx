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

const Container = ({ component: Field, label, ...props }) => {
  return (
    <label>
      <div>{label}</div>
      <Field {...props} />
      <FieldErrors errors={...props.errors} />
    </label>
  );
};

export default Container;

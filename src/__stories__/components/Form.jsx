import * as React from 'react';
import useFormFields, { FieldContainer } from '../../index';
import Container from './Container';

export default function Form({
  formName = 'Test Form',
  initialFields,
  onSubmit,
}) {
  const [fields, fns] = useFormFields({ initialFields, onSubmit });
  const { handleSubmit, onChange, onBlur, clearValues } = fns;

  return (
    <section>
      <form onSubmit={evt => handleSubmit(evt)}>
        <fieldset>
          <legend>{formName}</legend>
          {fields.map(field => (
            <FieldContainer
              {...{
                ...field,
                key: field.name,
                onBlur,
                onChange,
                children: Container,
              }}
            />
          ))}
        </fieldset>
        <br />
        <button type="submit">Submit</button>
        <button type="button" onClick={() => clearValues()}>
          reset
        </button>
      </form>
    </section>
  );
}

import * as React from 'react';
import {storiesOf} from '@storybook/react';
import useFormFields from '../index';
import ShowDocs from '../utils/ShowDocs';
import initialFields from '../__mocks__/fields'
import FieldContainer from './components/FieldContainer';

const Demo = () => {
  const [
    fields,
    handleChange,
    submit,
    validateOnBlur,
    clearValues,
  ] = useFormFields(initialFields);

  const handleSubmit = (evt) => {
    evt.preventDefault();
    const values = submit();
    console.log(values);
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        {fields.map((field) => (
          <FieldContainer
            {...{
              key: field.name,
              validateOnBlur,
              handleChange,
              ...field,
            }}
          />
        ))}
        <br />
        <button type="submit">Submit</button>
        <button type="button" onClick={clearValues}>
          reset
        </button>
      </form>
    </section>
  );
};

storiesOf('first', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/useFormInputs.md')} />)
  .add('Demo', () =>
    <Demo/>
  )
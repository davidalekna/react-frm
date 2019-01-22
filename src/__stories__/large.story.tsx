import * as React from 'react';
import { storiesOf } from '@storybook/react';
import useFormFields, { FieldContainer } from '../index';
import ShowDocs from '../utils/ShowDocs';
import initialFields from './fields';
import Container from './components/Container';

const Demo = () => {
  const [fields, fns] = useFormFields(initialFields);
  const {
    handleChange,
    handleSubmit: submit,
    validateOnBlur,
    clearValues,
  } = fns;

  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    const values = submit();
    console.log(values);
  };

  return (
    <section>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Test Form</legend>
          {fields.map(field => (
            <FieldContainer
              {...{
                ...field,
                key: field.name,
                validateOnBlur,
                handleChange,
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
};

storiesOf('large form', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/large.md')} />)
  .add('Demo', () => <Demo />);

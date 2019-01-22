import * as React from 'react';
import { storiesOf } from '@storybook/react';
import useFormFields, { FieldContainer } from '../index';
import ShowDocs from '../utils/ShowDocs';
import { person, address, otherFields } from './fields/categories';
import Container from './components/Container';

const Demo = () => {
  const [fields, fns] = useFormFields(person);
  const {
    addFields,
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
      <div>
        Add additional fields
        <button onClick={() => addFields(address)}>add address fields</button>
        <button onClick={() => addFields(otherFields)}>add other fields</button>
      </div>
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

storiesOf('construct', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/construct.md')} />)
  .add('Demo', () => <Demo />);

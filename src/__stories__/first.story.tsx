import * as React from 'react';
import { storiesOf } from '@storybook/react';
import useFormFields, { FieldContainer } from '../index';
import ShowDocs from '../utils/ShowDocs';
import initialFields from '../__mocks__/fields';
import Container from './components/Container';

const onSubmit = ([values]) => {
  console.log(values);
};

const Demo = () => {
  const [fields, fns] = useFormFields({ initialFields, onSubmit });
  const { handleChange, handleSubmit, onBlur, clearValues } = fns;

  return (
    <section>
      <form onSubmit={evt => handleSubmit(evt)}>
        <fieldset>
          <legend>Test Form</legend>
          {fields.map(field => (
            <FieldContainer
              {...{
                ...field,
                key: field.name,
                onBlur,
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

storiesOf('first', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/useFormInputs.md')} />)
  .add('Demo', () => <Demo />);

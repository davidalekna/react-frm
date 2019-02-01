import * as React from 'react';
import { storiesOf } from '@storybook/react';
import useFormFields, { FieldContainer } from '../index';
import ShowDocs from '../utils/ShowDocs';
import { person, address, otherFields } from './fields/categories';
import Container from './components/Container';

const onSubmit = ([values]) => {
  console.log(values);
};

const Demo = () => {
  const [fields, fns] = useFormFields({ initialFields: person, onSubmit });
  const { handleSubmit, handleChange, addFields, onBlur, clearValues } = fns;

  const categories = fields.reduce(
    (acc, val) => ({
      ...acc,
      [val.category]: acc[val.category] ? acc[val.category].concat(val) : [val],
    }),
    {},
  );

  return (
    <section>
      <div>
        Add additional fields
        <button onClick={() => addFields(address)}>add address fields</button>
        <button onClick={() => addFields(otherFields)}>add other fields</button>
      </div>
      <form onSubmit={handleSubmit}>
        {Object.keys(categories).map((category, key) => (
          <fieldset key={key}>
            <legend>{category}</legend>
            {categories[category].map(field => (
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
        ))}
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

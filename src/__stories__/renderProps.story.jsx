import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Wrapper } from './components/styles';
import { Form, Field, FieldName } from '../index';
import ShowDocs from '../utils/ShowDocs';
import initialFields from './fields/antd';
import Container from './components/Container';

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

const Demo = () => {
  const onSubmit = ([values]) => {
    console.log(values);
  };

  return (
    <Wrapper>
      <Form initialFields={initialFields} onSubmit={onSubmit}>
        {({ handleSubmit, clearValues }) => (
          <form onSubmit={handleSubmit}>
            <FieldName
              name="firstName"
              render={({ errors, component: FComponent, ...props }) => {
                return (
                  <label>
                    {props.label}
                    <FComponent {...props} />
                    <FieldErrors errors={errors} />
                  </label>
                );
              }}
            />
            <FieldName
              name="lastName"
              render={({ errors, component: FComponent, ...props }) => {
                return (
                  <label>
                    {props.label}
                    <FComponent {...props} />
                    <FieldErrors errors={errors} />
                  </label>
                );
              }}
            />
            <FieldName
              name="address.line_1"
              render={({ errors, component: FComponent, ...props }) => {
                return (
                  <label>
                    {props.label}
                    <FComponent {...props} />
                    <FieldErrors errors={errors} />
                  </label>
                );
              }}
            />
            <FieldName
              name="address.line_2"
              render={({ errors, component: FComponent, ...props }) => {
                return (
                  <label>
                    {props.label}
                    <FComponent {...props} />
                    <FieldErrors errors={errors} />
                  </label>
                );
              }}
            />
            <br />
            <button type="submit">Submit</button>
            <button type="button" onClick={() => clearValues()}>
              reset
            </button>
          </form>
        )}
      </Form>
    </Wrapper>
  );
};

storiesOf('render props', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/construct.md')} />)
  .add('Demo', () => <Demo />);

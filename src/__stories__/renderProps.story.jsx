import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Wrapper } from './components/styles';
import { Form, Fields, Field } from '../index';
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
        {({ handleSubmit, clearValues }) => {
          return (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Field
                    name="firstName"
                    render={({ errors, component: FComponent, ...props }) => {
                      console.log(`rendering ${props.label}`);
                      return (
                        <label>
                          {props.label}
                          <FComponent {...props} />
                          <FieldErrors errors={errors} />
                        </label>
                      );
                    }}
                  />
                  <Field
                    name="lastName"
                    render={({ errors, component: FComponent, ...props }) => {
                      console.log(`rendering ${props.label}`);
                      return (
                        <label>
                          {props.label}
                          <FComponent {...props} />
                          <FieldErrors errors={errors} />
                        </label>
                      );
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <Field
                    name="address.line_1"
                    render={({ errors, component: FComponent, ...props }) => {
                      console.log(`rendering ${props.label}`);
                      return (
                        <label>
                          {props.label}
                          <FComponent {...props} />
                          <FieldErrors errors={errors} />
                        </label>
                      );
                    }}
                  />
                  <Field
                    name="address.line_2"
                    render={({ errors, component: FComponent, ...props }) => {
                      console.log(`rendering ${props.label}`);
                      return (
                        <label>
                          {props.label}
                          <FComponent {...props} />
                          <FieldErrors errors={errors} />
                        </label>
                      );
                    }}
                  />
                </div>
              </div>
              <br />
              <div>
                <button type="submit">Submit</button>
                <button type="button" onClick={() => clearValues()}>
                  reset
                </button>
              </div>
            </form>
          );
        }}
      </Form>
    </Wrapper>
  );
};

storiesOf('render props', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/construct.md')} />)
  .add('Demo', () => <Demo />);

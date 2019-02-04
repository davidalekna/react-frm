import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Wrapper } from './components/styles';
import { Form, Fields, Field } from '../index';
import ShowDocs from '../utils/ShowDocs';
import initialFields from './fields/antd';
import Container from './components/Container';
import styled from 'styled-components';

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Label = styled.label`
  width: 100%;
  padding: 0 5px;
`;

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
              <fieldset>
                <legend>Render Props</legend>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Row>
                    <Field
                      name="firstName"
                      render={({ errors, component: FComponent, ...props }) => {
                        console.log(`rendering ${props.label}`);
                        return (
                          <Label>
                            {props.label}
                            <FComponent {...props} />
                            <FieldErrors errors={errors} />
                          </Label>
                        );
                      }}
                    />
                    <Field
                      name="lastName"
                      render={({ errors, component: FComponent, ...props }) => {
                        console.log(`rendering ${props.label}`);
                        return (
                          <Label>
                            {props.label}
                            <FComponent {...props} />
                            <FieldErrors errors={errors} />
                          </Label>
                        );
                      }}
                    />
                  </Row>
                  <Row>
                    <Field
                      name="address.line_1"
                      render={({ errors, component: FComponent, ...props }) => {
                        console.log(`rendering ${props.label}`);
                        return (
                          <Label>
                            {props.label}
                            <FComponent {...props} />
                            <FieldErrors errors={errors} />
                          </Label>
                        );
                      }}
                    />
                    <Field
                      name="address.line_2"
                      render={({ errors, component: FComponent, ...props }) => {
                        console.log(`rendering ${props.label}`);
                        return (
                          <Label>
                            {props.label}
                            <FComponent {...props} />
                            <FieldErrors errors={errors} />
                          </Label>
                        );
                      }}
                    />
                  </Row>
                </div>
                <br />
                <div>
                  <button type="submit">Submit</button>
                  <button type="button" onClick={() => clearValues()}>
                    reset
                  </button>
                </div>
              </fieldset>
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

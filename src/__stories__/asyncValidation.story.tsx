import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { Wrapper } from './components/styles';
import { Form } from '../index';
import ShowDocs from '../__utils__/ShowDocs';
import initialFields from './asyncFields';
import { renderFields } from './forms/renderFields';

const Demo = () => {
  const onSubmit = values => {
    console.log(values);
  };

  return (
    <Wrapper>
      <Form initialFields={initialFields} onSubmit={onSubmit}>
        {({ fields, handleSubmit, reset }) => {
          return (
            <form onSubmit={evt => handleSubmit(evt)}>
              <fieldset>
                <legend>Async Validation</legend>
                {renderFields({ fields })}
                <br />
                <div>
                  {/* disabled={!touched} */}
                  <button type="submit">Submit</button>
                  <button type="button" onClick={() => reset()}>
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

storiesOf('async validation', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/construct.md')} />)
  .add('Demo', () => <Demo />);

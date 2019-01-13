import * as React from 'react';
import {storiesOf} from '@storybook/react';
import useFormInputs from '../index';
import ShowDocs from '../utils/ShowDocs';

const Demo = () => {
  const state = useFormInputs([]);
  
  return (
    <div>
      <div>whats poppin</div>
    </div>
  );
};

storiesOf('someFormsExample', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/useFormInputs.md')} />)
  .add('Demo', () =>
    <Demo/>
  )
import * as React from 'react';
import {storiesOf} from '@storybook/react';
import useFormInputs from '..';
import ShowDocs from '../utils/ShowDocs';

const Demo = () => {
  const state = useFormInputs([]);

  return (
    <pre>
      {JSON.stringify(state, null, 2)}
    </pre>
  );
};

storiesOf('useFormInputs', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/useFormInputs.md')} />)
  .add('Demo', () =>
    <Demo/>
  )
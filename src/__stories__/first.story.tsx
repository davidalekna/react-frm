import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ShowDocs from '../utils/ShowDocs';
import initialFields from '../__mocks__/fields';
import Form from './components/Form';

const onSubmit = ([values]) => {
  console.log(values);
};

const Demo = () => {
  return <Form initialFields={initialFields} onSubmit={onSubmit} />;
};

storiesOf('first', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/useFormInputs.md')} />)
  .add('Demo', () => <Demo />);

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ShowDocs from '../utils/ShowDocs';
import initialFields from './fields/nested';
import Form from './components/Form';

const onSubmit = ([values]) => {
  console.log(values);
};

const Demo = () => {
  return <Form initialFields={initialFields} onSubmit={onSubmit} />;
};

storiesOf('nested', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/useFormInputs.md')} />)
  .add('Demo', () => <Demo />);

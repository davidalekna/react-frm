import * as React from 'react';
import { storiesOf } from '@storybook/react';
import ShowDocs from '../utils/ShowDocs';
import initialFields from './fields/antd';
import Form from './components/Form';

const onSubmit = ([values]) => {
  console.log(values);
};

const Demo = () => {
  return (
    <div style={{ padding: 50 }}>
      <Form initialFields={initialFields} onSubmit={onSubmit} />
    </div>
  );
};

storiesOf('ant design', module)
  .add('Docs', () => <ShowDocs md={require('../../docs/useFormInputs.md')} />)
  .add('Demo', () => <Demo />);

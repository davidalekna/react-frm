import * as React from 'react';
import Select from 'react-select';
import { notEmpty } from '../../__mocks__/validation';

function fieldsMapper({ type, options, ...props }) {
  switch (type) {
    case 'select':
      return (
        <Select
          {...props}
          options={options}
          onChange={value => props.onChange({ name: props.name, value })}
          onBlur={value => props.onBlur({ name: props.name, value })}
        />
      );
    default:
      return <input type={type} {...props} />;
  }
}

export default [
  {
    label: 'Favourite Fruit',
    value: '',
    name: 'faveFruit',
    type: 'select',
    requirements: [notEmpty],
    options: [
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'vanilla', label: 'Vanilla' },
    ],
  },
].map(field => ({ ...field, component: fieldsMapper }));

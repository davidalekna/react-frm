import * as React from 'react';
import { minLength, mustContainLetter } from './validation';

// todo Select from dropdown component

function inputComponentReducer({ type, ...props }) {
  switch (type) {
    case 'text':
      return <input type={type} {...props} />;
    case 'number':
      return <input type={type} {...props} />;
    case 'checkbox':
      return <input type={type} {...props} />;
    case 'date':
      return <input type={type} {...props} />;
    default:
      return null;
  }
}

export default [
  {
    label: 'First Name',
    value: '',
    placeholder: 'Donald',
    name: 'firstName',
    type: 'text',
    requirements: [
      minLength(3),
      mustContainLetter('a'),
      mustContainLetter('b'),
      mustContainLetter('c'),
    ],
    component: inputComponentReducer,
  },
  {
    label: 'Last Name',
    value: '',
    placeholder: 'Trump',
    name: 'lastName',
    type: 'text',
    requirements: [minLength(6), mustContainLetter('d')],
    component: inputComponentReducer,
  },
  {
    label: 'Date of Birth',
    value: '',
    name: 'dob',
    type: 'date',
    component: inputComponentReducer,
  },
  {
    label: 'Favourite number',
    value: 0,
    name: 'favouriteNumber',
    type: 'number',
    component: inputComponentReducer,
  },
  {
    label: 'Like apples',
    value: false,
    name: 'apples',
    type: 'checkbox',
    component: inputComponentReducer,
  },
];

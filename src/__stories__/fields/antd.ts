import fieldsMapper from '../fieldsMappers/antd';
import { notEmpty } from '../../__mocks__/validation';

export default [
  {
    label: 'First Name',
    value: '',
    placeholder: 'Donald',
    name: 'firstName',
    type: 'text',
    requirements: [notEmpty],
  },
  {
    label: 'Last Name',
    value: '',
    placeholder: 'Trump',
    name: 'lastName',
    type: 'text',
  },
  {
    label: 'Date of Birth',
    value: '',
    name: 'dob',
    type: 'date',
  },
  {
    label: 'Line 1',
    value: '',
    name: 'address.line_1',
    type: 'text',
  },
  {
    label: 'Line 2',
    value: '',
    name: 'address.line_2',
    type: 'text',
  },
  {
    label: 'City',
    value: '',
    name: 'address.city',
    type: 'text',
  },
  {
    label: 'Postcode',
    value: '',
    name: 'address.postcode',
    type: 'text',
  },
  {
    label: 'Like apples',
    value: false,
    name: 'apples',
    type: 'checkbox',
  },
  {
    label: 'Favourite Fruit',
    value: '',
    name: 'faveFruit',
    type: 'select',
    options: [
      { value: 'grapefruit' },
      { value: 'lime' },
      { value: 'coconut' },
      { value: 'mango' },
    ],
  },
].map(field => ({ ...field, component: fieldsMapper }));

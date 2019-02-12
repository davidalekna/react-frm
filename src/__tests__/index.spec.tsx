import { errorPusher } from '../index';
import {
  minLength,
  mustContainLetter,
  notEmpty,
} from '../__mocks__/validation';

test('errorPusher should add errors to the field object', () => {
  const initialField = {
    name: 'testField',
    value: 'some test value',
    type: 'text',
  };
  const fieldWithMinLength = {
    ...initialField,
    name: 'testMinLength',
    requirements: [minLength(20)],
  };
  const fieldMustContainLetter = {
    ...initialField,
    name: 'testFieldWithLetter',
    requirements: [mustContainLetter('r')],
  };
  const fieldNotEmpty = {
    ...initialField,
    value: '',
    requirements: [notEmpty],
  };

  expect(errorPusher(initialField)).toEqual(initialField);
  expect(errorPusher(fieldWithMinLength)).toEqual({
    ...fieldWithMinLength,
    errors: ['Must be 20 characters or more'],
  });
  expect(errorPusher(fieldMustContainLetter)).toEqual({
    ...fieldMustContainLetter,
    errors: ['Must contain letter r'],
  });
  expect(errorPusher(fieldNotEmpty)).toEqual({
    ...fieldNotEmpty,
    errors: ['Cannot be empty'],
  });
});

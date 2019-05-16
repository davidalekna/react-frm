import * as React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import {
  ErrorMessage,
  FormLabel,
  StyledLabel,
} from '../../components/formElements';

export function DatePicker({ label, meta, showError = true, ...field }) {
  return (
    <StyledLabel>
      {label && <FormLabel>{label}</FormLabel>}
      <AntDatePicker
        onChange={date => field.onChange({ name: field.name, value: date })}
      />
      {meta && meta.touched && meta.error && showError && (
        <ErrorMessage>{meta.error}</ErrorMessage>
      )}
    </StyledLabel>
  );
}

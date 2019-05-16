import * as React from 'react';
import { Input } from 'antd';
import {
  ErrorMessage,
  FormLabel,
  StyledLabel,
} from '../../components/formElements';

export function Text({ label, type, meta, showError = true, ...field }) {
  return (
    <StyledLabel>
      {label && <FormLabel>{label}</FormLabel>}
      <Input type={type} {...field} />
      {meta && meta.touched && meta.error && showError && (
        <ErrorMessage>{meta.error}</ErrorMessage>
      )}
    </StyledLabel>
  );
}

import * as React from 'react';
import { Input } from 'antd';
import {
  FieldErrors,
  FormLabel,
  StyledLabel,
} from '../../components/formElements';

export function Text({ label, type, meta, showError = true, ...field }) {
  return (
    <StyledLabel>
      {label && <FormLabel>{label}</FormLabel>}
      <Input type={type} {...field} />
      <FieldErrors errors={field.errors} />
    </StyledLabel>
  );
}

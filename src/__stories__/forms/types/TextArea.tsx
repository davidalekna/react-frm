import * as React from 'react';
import { Input } from 'antd';
import {
  FieldErrors,
  FormLabel,
  StyledLabel,
} from '../../components/formElements';

export function TextArea({ label, meta, showError = true, ...field }) {
  return (
    <StyledLabel>
      {label && <FormLabel>{label}</FormLabel>}
      <Input.TextArea rows={4} {...field} />
      <FieldErrors errors={field.errors} />
    </StyledLabel>
  );
}

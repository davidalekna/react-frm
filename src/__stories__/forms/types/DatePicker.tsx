import * as React from 'react';
import { DatePicker as AntDatePicker } from 'antd';
import {
  FieldErrors,
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
      <FieldErrors errors={field.errors} />
    </StyledLabel>
  );
}

import * as React from 'react';
import { Checkbox as AntCheckbox } from 'antd';
import {
  ErrorMessage,
  FormLabel,
  StyledLabel,
} from '../../components/formElements';

export function Checkbox({ label, meta, showError = true, ...field }) {
  return (
    <StyledLabel>
      {label && <FormLabel>{label}</FormLabel>}
      <AntCheckbox
        defaultChecked={field.checked}
        checked={field.value}
        onChange={evt =>
          field.onChange({ name: field.name, value: evt.target.checked })
        }
      >
        {field.label}
      </AntCheckbox>
      {meta && meta.touched && meta.error && showError && (
        <ErrorMessage>{meta.error}</ErrorMessage>
      )}
    </StyledLabel>
  );
}

import * as React from 'react';
import { Checkbox as AntCheckbox } from 'antd';
import {
  FieldErrors,
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
      <FieldErrors errors={field.errors} />
    </StyledLabel>
  );
}

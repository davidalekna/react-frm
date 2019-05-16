import * as React from 'react';
import { Input } from 'antd';
import { MemoField } from '../../../../index';
import { FieldErrors, FormLabel, StyledLabel } from '../../formElements';

export function Text(field) {
  return (
    <MemoField field={field}>
      {({ label, type, meta, showError = true, ...field }) => {
        return (
          <StyledLabel>
            {label && <FormLabel>{label}</FormLabel>}
            <Input disabled={meta.loading} type={type} {...field} />
            <FieldErrors errors={meta && meta.errors} />
          </StyledLabel>
        );
      }}
    </MemoField>
  );
}

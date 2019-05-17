import * as React from 'react';
import { Input } from 'antd';
import { MemoField } from '../../../../index';
import {
  FieldErrors,
  FormLabel,
  StyledLabel,
  FieldLoader,
} from '../../formElements';

export function Text(field) {
  return (
    <MemoField field={field}>
      {({ label, type, meta, showError = true, ...field }) => {
        return (
          <StyledLabel>
            {label && <FormLabel>{label}</FormLabel>}
            {meta.loading && <FieldLoader />}
            <Input type={type} {...field} />
            <FieldErrors errors={meta && meta.errors} />
          </StyledLabel>
        );
      }}
    </MemoField>
  );
}

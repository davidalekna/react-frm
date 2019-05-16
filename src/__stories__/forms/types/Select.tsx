import * as React from 'react';
import { Select as AntSelect } from 'antd';
import {
  ErrorMessage,
  FormLabel,
  StyledLabel,
} from '../../components/formElements';

export function Select({ label, meta, showError = true, ...field }) {
  const innerEvent = value =>
    field.onChange({
      name: field.name,
      value,
    });

  return (
    <StyledLabel>
      {label && <FormLabel>{label}</FormLabel>}
      <AntSelect
        {...field}
        defaultValue={null}
        onChange={innerEvent}
        onBlur={innerEvent}
      >
        {field.options.map(option => (
          <AntSelect.Option key={option.value} value={option.value}>
            {option.value}
          </AntSelect.Option>
        ))}
      </AntSelect>
      {meta && meta.touched && meta.error && showError && (
        <ErrorMessage>{meta.error}</ErrorMessage>
      )}
    </StyledLabel>
  );
}

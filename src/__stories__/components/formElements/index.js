import React from 'react';
import styled from 'styled-components';

export const StyledLabel = styled.label``;

export const FormLabel = styled.div`
  font-weight: 400;
`;

export function FieldErrors({ errors = [] }: { errors: string[] }) {
  if (errors.length) {
    return (
      <ul>
        {errors.map((err, key) => (
          <li key={key} style={{ color: 'violet' }}>
            {err}
          </li>
        ))}
      </ul>
    );
  }
  return null;
}

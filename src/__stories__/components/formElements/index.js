import React from 'react';
import styled from 'styled-components';

export const StyledLabel = styled.label``;

export const ErrorMessage = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  background: ${({ theme }) =>
    tinycolor(theme.colours.brand.red)
      .lighten(45)
      .toString()};
  border-radius: 4px;
  padding: 8px;
  outline: none;
  border: none;
`;

export const FormLabel = styled.div`
  font-weight: 400;
`;

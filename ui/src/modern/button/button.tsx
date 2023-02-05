import React, { FunctionComponent } from "react";
import styled from "styled-components";
import { Button as ButtonCommon, ButtonProps } from "../../common";

export const ButtonWraper: FunctionComponent<ButtonProps> = ({
  children,
  onClick,
  className,
  ariaLabel,
}) => (
  <ButtonCommon onClick={onClick} className={className} ariaLabel={ariaLabel}>
    {children}
  </ButtonCommon>
);

export const Button = styled(ButtonWraper)`
  font-weight: light;
  border-radius: 13px;
`;

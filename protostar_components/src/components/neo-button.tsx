'use client';

import * as React from 'react';
import { cx } from '../lib/cx';

export type NeoButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'ghost';

export interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual weight of the button. Defaults to `secondary`. */
  variant?: NeoButtonVariant;
}

export const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(function NeoButton(
  { variant = 'secondary', className, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx('neo-button', `neo-button--${variant}`, className)}
      {...props}
    >
      <span className="neo-button-content">{props.children}</span>
    </button>
  );
});

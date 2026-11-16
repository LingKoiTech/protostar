'use client';

import * as React from 'react';
import { cx } from '../lib/cx';

type DataAttributes = { [key: `data-${string}`]: string | number | boolean | undefined };

export interface NeoInputSlots {
  /** Attributes for the decorative wrapper that draws the field surface. */
  root?: React.HTMLAttributes<HTMLDivElement> & DataAttributes;
  /** Attributes for the leading icon wrapper. */
  icon?: React.HTMLAttributes<HTMLSpanElement> & DataAttributes;
  /** Attributes for the trailing adornment wrapper. */
  trailing?: React.HTMLAttributes<HTMLSpanElement> & DataAttributes;
}

export interface NeoInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** `className` is applied to the wrapper surface, never to the `<input>`. */
  className?: string;
  /** Leading icon slot. */
  icon?: React.ReactNode;
  /** Trailing adornment slot (status icon, reveal toggle, ...). */
  trailing?: React.ReactNode;
  /** Extra attributes for the internal pieces, useful for tests and layout. */
  slots?: NeoInputSlots;
}

/**
 * Flat text field with optional leading/trailing adornments.
 *
 * The `ref` is forwarded to the native `<input>`; `slots.root` is the only way
 * to reach the styled wrapper.
 */
export const NeoInput = React.forwardRef<HTMLInputElement, NeoInputProps>(function NeoInput(
  { icon, trailing, className, slots, ...props },
  ref,
) {
  const { className: rootClassName, ...rootProps } = slots?.root ?? {};
  const { className: iconClassName, ...iconProps } = slots?.icon ?? {};
  const { className: trailingClassName, ...trailingProps } = slots?.trailing ?? {};

  return (
    <div className={cx('neo-input-wrap', className, rootClassName)} {...rootProps}>
      {icon ? (
        <span aria-hidden="true" className={cx('neo-input-icon', iconClassName)} {...iconProps}>
          {icon}
        </span>
      ) : null}
      <input ref={ref} className="neo-input" {...props} />
      {trailing ? (
        <span className={cx('neo-input-trailing', trailingClassName)} {...trailingProps}>
          {trailing}
        </span>
      ) : null}
    </div>
  );
});

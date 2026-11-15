import * as React from 'react';
import { cx } from '../lib/cx';

export interface NeoSwatchProps extends React.HTMLAttributes<HTMLElement> {
  /** Base chip color, exposed as --neo-swatch-color. */
  color?: string;
  /** Optional gradient treatment used by reference swatches. */
  gradient?: string;
}

/** Flat color chip with a raised edge and a soft top highlight. */
export function NeoSwatch({ color, gradient, className, style, ...props }: NeoSwatchProps) {
  return (
    <i
      aria-hidden="true"
      className={cx('neo-swatch', className)}
      style={{ ...style, ...(color ? ({ '--neo-swatch-color': color } as React.CSSProperties) : {}), ...(gradient ? ({ '--neo-swatch-gradient': gradient } as React.CSSProperties) : {}) }}
      {...props}
    />
  );
}

'use client';

import * as React from 'react';
import { Radio, type RadioRootProps, type RadioRootState } from '@base-ui/react/radio';
import { mergeClassName, type NeoClassNameInput } from '../lib/cx';

export interface NeoRadioProps extends Omit<RadioRootProps, 'className' | 'ref'> {
  /** Base UI className, including state-aware functions. */
  className?: NeoClassNameInput<RadioRootState>;
}

/**
 * Base UI radio with a raised circular surface and a gradient dot when
 * selected. Extra children are rendered inside the root instead of being
 * discarded.
 */
export const NeoRadio = React.forwardRef<HTMLElement, NeoRadioProps>(function NeoRadio(
  { className, children, ...props },
  ref,
) {
  return (
    <Radio.Root ref={ref} className={mergeClassName('neo-radio', className)} {...props}>
      <Radio.Indicator className="neo-radio-indicator" />
      {children}
    </Radio.Root>
  );
});

'use client';

import * as React from 'react';
import { RadioGroup, type RadioGroupProps, type RadioGroupState } from '@base-ui/react/radio-group';
import { mergeClassName, type NeoClassNameInput } from '../lib/cx';

export interface NeoRadioGroupProps extends Omit<RadioGroupProps, 'className' | 'ref'> {
  /** Base UI className, including state-aware functions. */
  className?: NeoClassNameInput<RadioGroupState>;
}

/** Base UI radio group laid out as a horizontal row of raised radios. */
export const NeoRadioGroup = React.forwardRef<HTMLDivElement, NeoRadioGroupProps>(function NeoRadioGroup(
  { className, ...props },
  ref,
) {
  return (
    <RadioGroup ref={ref} className={mergeClassName('neo-radio-group', className)} {...props} />
  );
});

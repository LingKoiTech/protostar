'use client';

import * as React from 'react';
import { Checkbox, type CheckboxRootProps, type CheckboxRootState } from '@base-ui/react/checkbox';
import { Check } from 'lucide-react';
import { mergeClassName, type NeoClassNameInput } from '../lib/cx';

export interface NeoCheckboxProps extends Omit<CheckboxRootProps, 'className' | 'ref'> {
  /** Base UI className, including state-aware functions. */
  className?: NeoClassNameInput<CheckboxRootState>;
}

/**
 * Base UI checkbox with a raised cold-gray tile and a gradient check mark.
 * Extra children are rendered inside the root instead of being discarded.
 */
export const NeoCheckbox = React.forwardRef<HTMLElement, NeoCheckboxProps>(function NeoCheckbox(
  { className, children, ...props },
  ref,
) {
  return (
    <Checkbox.Root ref={ref} className={mergeClassName('neo-checkbox', className)} {...props}>
      <Checkbox.Indicator className="neo-checkbox-indicator">
        <Check aria-hidden="true" />
      </Checkbox.Indicator>
      {children}
    </Checkbox.Root>
  );
});

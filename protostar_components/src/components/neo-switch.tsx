'use client';

import * as React from 'react';
import { Switch, type SwitchRootProps, type SwitchRootState } from '@base-ui/react/switch';
import { mergeClassName, type NeoClassNameInput } from '../lib/cx';

export interface NeoSwitchProps extends Omit<SwitchRootProps, 'children' | 'className' | 'ref'> {
  /** Base UI className, including state-aware functions. */
  className?: NeoClassNameInput<SwitchRootState>;
}

/**
 * Base UI switch with the inset pill and raised thumb from the reference.
 *
 * `children` are intentionally omitted: the thumb is part of the primitive, so
 * accepting children here would only let them be silently dropped.
 */
export const NeoSwitch = React.forwardRef<HTMLElement, NeoSwitchProps>(function NeoSwitch(
  { className, ...props },
  ref,
) {
  return (
    <Switch.Root ref={ref} className={mergeClassName('neo-switch', className)} {...props}>
      <Switch.Thumb className="neo-switch-thumb" />
    </Switch.Root>
  );
});

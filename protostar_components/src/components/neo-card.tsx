import * as React from 'react';
import { cx } from '../lib/cx';

export type NeoCardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Raised cold-gray panel using the shared solid surface and paired soft shadows.
 * Layout and padding stay with the consuming application.
 */
export function NeoCard({ className, ...props }: NeoCardProps) {
  return <div className={cx('neo-card', className)} {...props} />;
}

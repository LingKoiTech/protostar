import * as React from 'react';
import { cx } from '../lib/cx';

export type NeoIconTileProps = React.HTMLAttributes<HTMLDivElement>;

/** Raised rounded square used behind an icon in the reference iconography. */
export function NeoIconTile({ className, ...props }: NeoIconTileProps) {
  return <div className={cx('neo-icon-tile', className)} {...props} />;
}

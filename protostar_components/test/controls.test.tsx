import * as React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import * as neomorphism from '../src';
import {
  NeoButton,
  NeoCard,
  NeoCheckbox,
  NeoIconTile,
  NeoInput,
  NeoRadio,
  NeoRadioGroup,
  NeoSwatch,
  NeoSwitch,
  cx,
  mergeClassName,
} from '../src';

describe('public entry', () => {
  it('exposes every primitive and helper', () => {
    const components = [
      'NeoCard',
      'NeoButton',
      'NeoInput',
      'NeoSwitch',
      'NeoCheckbox',
      'NeoRadioGroup',
      'NeoRadio',
      'NeoSwatch',
      'NeoIconTile',
    ];
    const helpers = ['cx', 'mergeClassName'];

    for (const name of components) {
      const primitive = neomorphism[name as keyof typeof neomorphism] as unknown as React.ComponentType<
        Record<string, unknown>
      >;

      expect(primitive).toBeDefined();
      expect(React.isValidElement(React.createElement(primitive, {}))).toBe(true);
    }

    for (const name of helpers) {
      expect(neomorphism[name as keyof typeof neomorphism]).toBeTypeOf('function');
    }
  });

  it('keeps state-aware className functions instead of stringifying them', () => {
    const merged = mergeClassName('base', (state: { checked: boolean }) => (state.checked ? 'on' : 'off'));

    expect(merged).toBeTypeOf('function');
    expect((merged as (state: { checked: boolean }) => string)({ checked: true })).toBe('base on');
    expect(cx('a', undefined, 'b', null, false)).toBe('a b');
  });
});

describe('static surfaces', () => {
  it('renders cards, icon tiles and swatches with merged classes and content', () => {
    render(
      <NeoCard className="card-extra" data-testid="card">
        <NeoIconTile className="tile-extra" data-testid="tile">
          <span aria-hidden="true">*</span>
        </NeoIconTile>
        <NeoSwatch color="#6C63FF" className="swatch-extra" data-testid="swatch" />
      </NeoCard>,
    );

    expect(screen.getByTestId('card')).toHaveClass('neo-card', 'card-extra');
    expect(screen.getByTestId('card')).toHaveTextContent('*');
    expect(screen.getByTestId('tile')).toHaveClass('neo-icon-tile', 'tile-extra');
    expect(screen.getByTestId('swatch')).toHaveClass('neo-swatch', 'swatch-extra');
    expect(screen.getByTestId('swatch').style.getPropertyValue('--neo-swatch-color')).toBe('#6C63FF');
  });

  it('renders buttons with their variant, default type and click handler', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <NeoButton variant="primary" onClick={onClick}>
        Save
      </NeoButton>,
    );

    const button = screen.getByRole('button', { name: 'Save' });

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('neo-button', 'neo-button--primary');

    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('NeoInput', () => {
  it('forwards refs and slots to the input, icon and trailing wrappers', () => {
    const ref = React.createRef<HTMLInputElement>();

    render(
      <NeoInput
        ref={ref}
        className="field-extra"
        placeholder="Search"
        aria-label="Search"
        icon={<span data-testid="icon" />}
        trailing={<span data-testid="trailing" />}
        slots={{
          root: { 'data-testid': 'root', className: 'root-extra' },
          icon: { className: 'icon-extra' },
          trailing: { className: 'trailing-extra' },
        }}
      />,
    );

    const input = screen.getByRole('textbox', { name: 'Search' });

    expect(ref.current).toBe(input);
    expect(input).toHaveClass('neo-input');
    expect(screen.getByTestId('root')).toHaveClass('neo-input-wrap', 'field-extra', 'root-extra');
    expect(screen.getByTestId('icon').parentElement).toHaveClass('neo-input-icon', 'icon-extra');
    expect(screen.getByTestId('trailing').parentElement).toHaveClass('neo-input-trailing', 'trailing-extra');
  });
});

describe('Base UI control primitives', () => {
  it('keeps accessible checked state through Base UI interactions', async () => {
    const user = userEvent.setup();

    render(
      <>
        <NeoSwitch aria-label="Notifications" defaultChecked />
        <NeoCheckbox aria-label="Email updates" defaultChecked />
        <NeoRadioGroup aria-label="Density" defaultValue="compact">
          <NeoRadio aria-label="Compact" value="compact" />
          <NeoRadio aria-label="Comfortable" value="comfortable" />
        </NeoRadioGroup>
      </>,
    );

    const notifications = screen.getByRole('switch', { name: 'Notifications' });
    const email = screen.getByRole('checkbox', { name: 'Email updates' });
    const compact = screen.getByRole('radio', { name: 'Compact' });
    const comfortable = screen.getByRole('radio', { name: 'Comfortable' });

    expect(notifications).toBeChecked();
    expect(notifications.querySelector('.neo-switch-thumb')).toBeInTheDocument();
    expect(email.querySelector('.neo-checkbox-indicator svg')).toBeInTheDocument();
    expect(compact).toBeChecked();
    expect(comfortable).not.toBeChecked();

    await user.click(notifications);
    await user.click(email);
    await user.click(comfortable);

    expect(notifications).not.toBeChecked();
    expect(email).not.toBeChecked();
    expect(compact).not.toBeChecked();
    expect(comfortable).toBeChecked();
  });

  it('applies state-aware classNames and keeps passed children', async () => {
    const user = userEvent.setup();

    render(
      <>
        <NeoSwitch
          aria-label="Wireless"
          className={(state) => (state.checked ? 'is-on' : 'is-off')}
        />
        <NeoCheckbox
          aria-label="Sync"
          className={(state) => (state.checked ? 'is-on' : 'is-off')}
        >
          <span data-testid="checkbox-child" />
        </NeoCheckbox>
        <NeoRadioGroup aria-label="Plan" defaultValue="monthly" className={() => 'group-extra'}>
          <NeoRadio aria-label="Monthly" value="monthly">
            <span data-testid="radio-child" />
          </NeoRadio>
        </NeoRadioGroup>
      </>,
    );

    const wireless = screen.getByRole('switch', { name: 'Wireless' });
    const sync = screen.getByRole('checkbox', { name: 'Sync' });

    expect(wireless).toHaveClass('neo-switch', 'is-off');
    expect(sync).toHaveClass('neo-checkbox', 'is-off');
    expect(screen.getByRole('radiogroup', { name: 'Plan' })).toHaveClass('neo-radio-group', 'group-extra');
    expect(screen.getByTestId('checkbox-child')).toBeInTheDocument();
    expect(screen.getByTestId('radio-child')).toBeInTheDocument();

    await user.click(wireless);
    await user.click(sync);

    expect(wireless).toHaveClass('is-on');
    expect(sync).toHaveClass('is-on');
  });
});


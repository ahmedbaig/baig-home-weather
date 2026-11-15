import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { ToastStore } from '../toaster.svelte';
import Button from './Button.svelte';
import Eyebrow from './Eyebrow.svelte';
import Input from './Input.svelte';
import StatusDot from './StatusDot.svelte';
import Toaster from './Toaster.svelte';
import Toggle from './Toggle.svelte';

const text = (value: string) => createRawSnippet(() => ({ render: () => `<span>${value}</span>` }));

describe('Button', () => {
  it('renders the variant and handles clicks', async () => {
    const onclick = vi.fn();
    render(Button, { variant: 'danger', onclick, children: text('Delete') });

    const button = screen.getByRole('button', { name: 'Delete' });
    expect(button).toHaveClass('danger');
    expect(button).toHaveAttribute('type', 'button');

    await fireEvent.click(button);
    expect(onclick).toHaveBeenCalledOnce();
  });
});

describe('Eyebrow', () => {
  it('pads the index', () => {
    render(Eyebrow, { index: 1, children: text('Posts') });
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
  });
});

describe('Input', () => {
  it('links the error message to the field', () => {
    render(Input, { label: 'Title', error: 'Title must be at least 3 characters' });

    const input = screen.getByLabelText('Title');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Title must be at least 3 characters');
  });
});

describe('Toggle', () => {
  it('flips state and reports the new value', async () => {
    const onchange = vi.fn();
    render(Toggle, { label: 'Published', checked: false, onchange });

    const toggle = screen.getByRole('switch', { name: 'Published' });
    await fireEvent.click(toggle);

    expect(toggle).toHaveAttribute('aria-checked', 'true');
    expect(onchange).toHaveBeenCalledWith(true);
  });
});

describe('StatusDot', () => {
  it('exposes the status for assistive tech', () => {
    render(StatusDot, { status: 'live', label: 'Live' });
    expect(screen.getByRole('status')).toHaveAttribute('data-status', 'live');
    expect(screen.getByText('Live')).toBeVisible();
  });
});

describe('Toaster', () => {
  it('shows error toasts with the request id and dismisses them', async () => {
    const store = new ToastStore();
    render(Toaster, { store });

    store.error({ message: 'Title is too short', requestId: 'req-123' });
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Title is too short');
    expect(alert).toHaveTextContent('Request req-123');

    await fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(store.items).toHaveLength(0);
  });
});

import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/utils';
import { GameButton } from '../GameButton';

describe('GameButton', () => {
  const defaultProps = {
    children: 'Test Button',
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders button with correct text', () => {
    renderWithProviders(<GameButton {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: 'Test Button' })
    ).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    renderWithProviders(<GameButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies variant styles correctly', () => {
    const { rerender } = renderWithProviders(
      <GameButton {...defaultProps} variant='primary' />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-gradient-to-r',
      'from-orange-500',
      'to-orange-600'
    );

    rerender(<GameButton {...defaultProps} variant='secondary' />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-slate-700', 'hover:bg-slate-600');

    rerender(<GameButton {...defaultProps} variant='danger' />);
    button = screen.getByRole('button');
    expect(button).toHaveClass(
      'bg-gradient-to-r',
      'from-red-500',
      'to-red-600'
    );
  });

  it('applies size styles correctly', () => {
    const { rerender } = renderWithProviders(
      <GameButton {...defaultProps} size='sm' />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('text-sm', 'px-3', 'py-1.5');

    rerender(<GameButton {...defaultProps} size='lg' />);
    button = screen.getByRole('button');
    expect(button).toHaveClass('text-lg', 'px-8', 'py-3');
  });

  it('disables button when disabled prop is true', () => {
    renderWithProviders(<GameButton {...defaultProps} disabled />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('shows loading state correctly', () => {
    renderWithProviders(<GameButton {...defaultProps} loading />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('prevents click when loading', () => {
    const onClick = jest.fn();
    renderWithProviders(
      <GameButton {...defaultProps} onClick={onClick} loading />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders icon correctly', () => {
    const icon = <span data-testid='test-icon'>🎮</span>;
    renderWithProviders(<GameButton {...defaultProps} icon={icon} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    renderWithProviders(
      <GameButton {...defaultProps} className='custom-class' />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('applies fullWidth style when specified', () => {
    renderWithProviders(<GameButton {...defaultProps} fullWidth />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('handles keyboard events', () => {
    const onClick = jest.fn();
    renderWithProviders(<GameButton {...defaultProps} onClick={onClick} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    renderWithProviders(
      <GameButton
        {...defaultProps}
        disabled
        aria-label='Game action button'
        role='button'
      />
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Game action button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('animates on hover', async () => {
    renderWithProviders(<GameButton {...defaultProps} />);

    const button = screen.getByRole('button');
    fireEvent.mouseEnter(button);

    await waitFor(() => {
      expect(button).toHaveClass('hover:scale-105');
    });
  });

  it('renders different button types', () => {
    const { rerender } = renderWithProviders(
      <GameButton {...defaultProps} type='submit' />
    );

    let button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');

    rerender(<GameButton {...defaultProps} type='reset' />);
    button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'reset');
  });

  it('handles edge cases', () => {
    // Test with empty children
    renderWithProviders(<GameButton onClick={jest.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();

    // Test with null onClick
    expect(() => {
      renderWithProviders(<GameButton>No Click Handler</GameButton>);
    }).not.toThrow();
  });

  it('supports ref forwarding', () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithProviders(<GameButton {...defaultProps} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});

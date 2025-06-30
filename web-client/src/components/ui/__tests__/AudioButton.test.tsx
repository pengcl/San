/**
 * AudioButton组件测试
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AudioButton from '../AudioButton';
import { useAudioFeedback } from '../../../hooks/useAudio';

// Mock useAudioFeedback hook
jest.mock('../../../hooks/useAudio', () => ({
  useAudioFeedback: jest.fn(),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    button: ({ children, whileHover, whileTap, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

const mockUseAudioFeedback = useAudioFeedback as jest.MockedFunction<typeof useAudioFeedback>;

describe('AudioButton Component', () => {
  const mockFeedbackFunctions = {
    withClickFeedback: jest.fn((handler) => handler),
    withHoverFeedback: jest.fn((handler) => handler),
    withSuccessFeedback: jest.fn((handler) => handler),
    withErrorFeedback: jest.fn((handler) => handler),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAudioFeedback.mockReturnValue(mockFeedbackFunctions);
  });

  describe('Basic rendering', () => {
    it('renders with children', () => {
      render(<AudioButton>Test Button</AudioButton>);
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('renders with default variant and size', () => {
      const { container } = render(<AudioButton>Default Button</AudioButton>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('bg-gradient-to-r');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
    });

    it('applies custom className', () => {
      const { container } = render(
        <AudioButton className="custom-class">Test</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('applies primary variant styles', () => {
      const { container } = render(
        <AudioButton variant="primary">Primary</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('from-blue-600');
      expect(button).toHaveClass('to-purple-600');
    });

    it('applies secondary variant styles', () => {
      const { container } = render(
        <AudioButton variant="secondary">Secondary</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('from-gray-100');
      expect(button).toHaveClass('to-gray-200');
    });

    it('applies success variant styles', () => {
      const { container } = render(
        <AudioButton variant="success">Success</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('from-green-500');
      expect(button).toHaveClass('to-emerald-600');
    });

    it('applies danger variant styles', () => {
      const { container } = render(
        <AudioButton variant="danger">Danger</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('from-red-500');
      expect(button).toHaveClass('to-pink-600');
    });

    it('applies ghost variant styles', () => {
      const { container } = render(
        <AudioButton variant="ghost">Ghost</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-transparent');
    });
  });

  describe('Sizes', () => {
    it('applies small size styles', () => {
      const { container } = render(
        <AudioButton size="small">Small</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('px-3');
      expect(button).toHaveClass('py-1.5');
      expect(button).toHaveClass('text-sm');
    });

    it('applies medium size styles', () => {
      const { container } = render(
        <AudioButton size="medium">Medium</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('text-base');
    });

    it('applies large size styles', () => {
      const { container } = render(
        <AudioButton size="large">Large</AudioButton>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('px-6');
      expect(button).toHaveClass('py-3');
      expect(button).toHaveClass('text-lg');
    });
  });

  describe('Audio feedback', () => {
    it('uses click feedback by default', () => {
      const mockOnClick = jest.fn();
      render(<AudioButton onClick={mockOnClick}>Click Me</AudioButton>);
      
      expect(mockFeedbackFunctions.withClickFeedback).toHaveBeenCalledWith(mockOnClick);
    });

    it('uses success feedback when soundType is success', () => {
      const mockOnClick = jest.fn();
      render(
        <AudioButton soundType="success" onClick={mockOnClick}>
          Success
        </AudioButton>
      );
      
      expect(mockFeedbackFunctions.withSuccessFeedback).toHaveBeenCalledWith(mockOnClick);
    });

    it('uses error feedback when soundType is error', () => {
      const mockOnClick = jest.fn();
      render(
        <AudioButton soundType="error" onClick={mockOnClick}>
          Error
        </AudioButton>
      );
      
      expect(mockFeedbackFunctions.withErrorFeedback).toHaveBeenCalledWith(mockOnClick);
    });

    it('does not apply audio feedback when soundType is none', () => {
      const mockOnClick = jest.fn();
      render(
        <AudioButton soundType="none" onClick={mockOnClick}>
          No Sound
        </AudioButton>
      );
      
      expect(mockFeedbackFunctions.withClickFeedback).not.toHaveBeenCalled();
      expect(mockFeedbackFunctions.withSuccessFeedback).not.toHaveBeenCalled();
      expect(mockFeedbackFunctions.withErrorFeedback).not.toHaveBeenCalled();
    });

    it('applies hover feedback', () => {
      const mockOnMouseEnter = jest.fn();
      render(
        <AudioButton onMouseEnter={mockOnMouseEnter}>Hover Me</AudioButton>
      );
      
      expect(mockFeedbackFunctions.withHoverFeedback).toHaveBeenCalledWith(mockOnMouseEnter);
    });

    it('does not apply audio feedback when disabled', () => {
      const mockOnClick = jest.fn();
      render(
        <AudioButton disabled onClick={mockOnClick}>
          Disabled
        </AudioButton>
      );
      
      // Should not call any feedback functions when disabled
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('does not apply audio feedback when loading', () => {
      const mockOnClick = jest.fn();
      render(
        <AudioButton loading onClick={mockOnClick}>
          Loading
        </AudioButton>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe('Icon handling', () => {
    it('renders left icon', () => {
      const icon = <span data-testid="left-icon">🔥</span>;
      render(
        <AudioButton icon={icon} iconPosition="left">
          With Icon
        </AudioButton>
      );
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      const icon = <span data-testid="right-icon">🔥</span>;
      render(
        <AudioButton icon={icon} iconPosition="right">
          With Icon
        </AudioButton>
      );
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('does not render right icon when loading', () => {
      const icon = <span data-testid="right-icon">🔥</span>;
      render(
        <AudioButton icon={icon} iconPosition="right" loading>
          Loading
        </AudioButton>
      );
      
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Loading state', () => {
    it('shows loading spinner when loading', () => {
      render(<AudioButton loading>Loading Button</AudioButton>);
      
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<AudioButton loading>Loading Button</AudioButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('does not show loading text when not loading', () => {
      render(<AudioButton>Normal Button</AudioButton>);
      
      expect(screen.queryByText('加载中...')).not.toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('disables button when disabled prop is true', () => {
      render(<AudioButton disabled>Disabled Button</AudioButton>);
      
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles', () => {
      const { container } = render(
        <AudioButton disabled>Disabled Button</AudioButton>
      );
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('opacity-50');
      expect(button).toHaveClass('cursor-not-allowed');
    });
  });

  describe('Event handling', () => {
    it('calls onClick handler when clicked', async () => {
      const mockOnClick = jest.fn();
      render(<AudioButton onClick={mockOnClick}>Click Me</AudioButton>);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(mockOnClick).toHaveBeenCalledTimes(1);
      });
    });

    it('calls onMouseEnter handler when hovered', async () => {
      const mockOnMouseEnter = jest.fn();
      render(
        <AudioButton onMouseEnter={mockOnMouseEnter}>Hover Me</AudioButton>
      );
      
      const button = screen.getByRole('button');
      fireEvent.mouseEnter(button);
      
      await waitFor(() => {
        expect(mockOnMouseEnter).toHaveBeenCalledTimes(1);
      });
    });

    it('does not call handlers when disabled', () => {
      const mockOnClick = jest.fn();
      const mockOnMouseEnter = jest.fn();
      
      render(
        <AudioButton
          disabled
          onClick={mockOnClick}
          onMouseEnter={mockOnMouseEnter}
        >
          Disabled
        </AudioButton>
      );
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.mouseEnter(button);
      
      expect(mockOnClick).not.toHaveBeenCalled();
      expect(mockOnMouseEnter).not.toHaveBeenCalled();
    });
  });

  describe('Button types', () => {
    it('renders with correct button type', () => {
      render(<AudioButton type="submit">Submit</AudioButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('defaults to button type', () => {
      render(<AudioButton>Default Type</AudioButton>);
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  describe('Accessibility', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<AudioButton ref={ref}>Test</AudioButton>);
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('has proper role', () => {
      render(<AudioButton>Test Button</AudioButton>);
      
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('maintains focus outline', () => {
      const { container } = render(<AudioButton>Focusable</AudioButton>);
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('focus:outline-none');
      expect(button).toHaveClass('focus:ring-2');
    });
  });
});
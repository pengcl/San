import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders, mockHeroes } from '../../../test/utils';
import { HeroCard } from '../HeroCard';

describe('HeroCard', () => {
  const mockHero = mockHeroes[0];
  const defaultProps = {
    hero: mockHero,
    onClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders hero information correctly', () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    expect(screen.getByText('关羽')).toBeInTheDocument();
    expect(screen.getByText('武圣')).toBeInTheDocument();
    expect(screen.getByText('Lv.30')).toBeInTheDocument();
    expect(screen.getByText('★★★★★')).toBeInTheDocument();
  });

  it('displays hero stats', () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    expect(screen.getByText('2800')).toBeInTheDocument(); // health
    expect(screen.getByText('450')).toBeInTheDocument(); // attack
    expect(screen.getByText('380')).toBeInTheDocument(); // defense
    expect(screen.getByText('320')).toBeInTheDocument(); // speed
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    renderWithProviders(<HeroCard {...defaultProps} onClick={onClick} />);

    const card = screen.getByTestId('hero-card');
    fireEvent.click(card);

    expect(onClick).toHaveBeenCalledWith(mockHero);
  });

  it('shows rarity styling', () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    const card = screen.getByTestId('hero-card');
    expect(card).toHaveClass('border-orange-400'); // legendary rarity
  });

  it('displays equipment information', () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    expect(screen.getByText('青龙偃月刀')).toBeInTheDocument();
    expect(screen.getByText('虎胆甲')).toBeInTheDocument();
  });

  it('shows selected state when specified', () => {
    renderWithProviders(<HeroCard {...defaultProps} selected />);

    const card = screen.getByTestId('hero-card');
    expect(card).toHaveClass('ring-2', 'ring-orange-500');
  });

  it('shows disabled state when specified', () => {
    renderWithProviders(<HeroCard {...defaultProps} disabled />);

    const card = screen.getByTestId('hero-card');
    expect(card).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('prevents click when disabled', () => {
    const onClick = jest.fn();
    renderWithProviders(
      <HeroCard {...defaultProps} onClick={onClick} disabled />
    );

    const card = screen.getByTestId('hero-card');
    fireEvent.click(card);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows compact view when specified', () => {
    renderWithProviders(<HeroCard {...defaultProps} compact />);

    const card = screen.getByTestId('hero-card');
    expect(card).toHaveClass('p-3'); // smaller padding in compact mode

    // Some elements should be hidden in compact mode
    expect(screen.queryByText('青龙偃月刀')).not.toBeInTheDocument();
  });

  it('displays action buttons when provided', () => {
    const actions = [
      <button key='edit' data-testid='edit-button'>
        编辑
      </button>,
      <button key='delete' data-testid='delete-button'>
        删除
      </button>,
    ];

    renderWithProviders(<HeroCard {...defaultProps} actions={actions} />);

    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('shows locked state for locked heroes', () => {
    const lockedHero = { ...mockHero, isLocked: true };
    renderWithProviders(<HeroCard hero={lockedHero} />);

    expect(screen.getByTestId('lock-icon')).toBeInTheDocument();

    const card = screen.getByTestId('hero-card');
    expect(card).toHaveClass('opacity-60');
  });

  it('displays experience progress bar', () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    const progressBar = screen.getByTestId('experience-progress');
    expect(progressBar).toBeInTheDocument();

    // Check progress value (should be calculated based on level and experience)
    const progress = progressBar.getAttribute('aria-valuenow');
    expect(progress).toBeTruthy();
  });

  it('shows faction badge', () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    expect(screen.getByText('蜀')).toBeInTheDocument();

    const factionBadge = screen.getByTestId('faction-badge');
    expect(factionBadge).toHaveClass('bg-blue-600'); // 蜀国颜色
  });

  it('handles different rarity levels', () => {
    const rarities = ['common', 'rare', 'epic', 'legendary'];

    rarities.forEach(rarity => {
      const hero = { ...mockHero, rarity: rarity as any };
      const { rerender } = renderWithProviders(<HeroCard hero={hero} />);

      const card = screen.getByTestId('hero-card');

      switch (rarity) {
        case 'common':
          expect(card).toHaveClass('border-gray-400');
          break;
        case 'rare':
          expect(card).toHaveClass('border-blue-400');
          break;
        case 'epic':
          expect(card).toHaveClass('border-purple-400');
          break;
        case 'legendary':
          expect(card).toHaveClass('border-orange-400');
          break;
      }

      rerender(<div />); // Clear for next iteration
    });
  });

  it('animates on hover', async () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    const card = screen.getByTestId('hero-card');
    fireEvent.mouseEnter(card);

    await waitFor(() => {
      expect(card).toHaveClass('hover:scale-105');
    });
  });

  it('supports keyboard navigation', () => {
    const onClick = jest.fn();
    renderWithProviders(<HeroCard {...defaultProps} onClick={onClick} />);

    const card = screen.getByTestId('hero-card');
    fireEvent.keyDown(card, { key: 'Enter' });

    expect(onClick).toHaveBeenCalledWith(mockHero);
  });

  it('has correct accessibility attributes', () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    const card = screen.getByTestId('hero-card');
    expect(card).toHaveAttribute('role', 'button');
    expect(card).toHaveAttribute('tabIndex', '0');
    expect(card).toHaveAttribute('aria-label', expect.stringContaining('关羽'));
  });

  it('handles missing hero data gracefully', () => {
    const incompleteHero = {
      id: 999,
      name: 'Test Hero',
      level: 1,
      // Missing other properties
    } as any;

    expect(() => {
      renderWithProviders(<HeroCard hero={incompleteHero} />);
    }).not.toThrow();

    expect(screen.getByText('Test Hero')).toBeInTheDocument();
  });

  it('renders custom className', () => {
    renderWithProviders(
      <HeroCard {...defaultProps} className='custom-hero-card' />
    );

    const card = screen.getByTestId('hero-card');
    expect(card).toHaveClass('custom-hero-card');
  });

  it('shows skill count', () => {
    renderWithProviders(<HeroCard {...defaultProps} />);

    // Hero has 2 skills
    expect(screen.getByText('技能: 2')).toBeInTheDocument();
  });

  it('handles long hero names correctly', () => {
    const heroWithLongName = {
      ...mockHero,
      name: '这是一个非常非常长的英雄名字用来测试文本截断',
    };

    renderWithProviders(<HeroCard hero={heroWithLongName} />);

    const nameElement = screen.getByText(heroWithLongName.name);
    expect(nameElement).toHaveClass('truncate');
  });
});

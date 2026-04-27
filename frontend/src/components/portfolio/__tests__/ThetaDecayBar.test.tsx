import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { ThetaDecayBar } from '../ThetaDecayBar';

describe('ThetaDecayBar', () => {
  test('renders nothing when dte is 0', () => {
    const { container } = render(<ThetaDecayBar theta={-0.05} dte={0} quantity={1} />);
    expect(container.innerHTML).toBe('');
  });

  test('renders nothing when theta is 0', () => {
    const { container } = render(<ThetaDecayBar theta={0} dte={10} quantity={1} />);
    expect(container.innerHTML).toBe('');
  });

  test('shows red bar color when dte <= 3', () => {
    const { container } = render(<ThetaDecayBar theta={-0.05} dte={2} quantity={1} />);
    const bar = container.querySelector('.bg-red-500');
    expect(bar).toBeInTheDocument();
  });

  test('shows amber bar color when dte <= 7', () => {
    const { container } = render(<ThetaDecayBar theta={-0.05} dte={5} quantity={1} />);
    const bar = container.querySelector('.bg-amber-500');
    expect(bar).toBeInTheDocument();
  });

  test('shows yellow bar color when dte <= 14', () => {
    const { container } = render(<ThetaDecayBar theta={-0.05} dte={10} quantity={1} />);
    const bar = container.querySelector('.bg-yellow-400');
    expect(bar).toBeInTheDocument();
  });

  test('shows blue bar color when dte > 14', () => {
    const { container } = render(<ThetaDecayBar theta={-0.05} dte={30} quantity={1} />);
    const bar = container.querySelector('.bg-blue-400');
    expect(bar).toBeInTheDocument();
  });

  test('displays daily decay amount correctly', () => {
    // theta=-0.05, quantity=2 => dailyDecay = 0.05 * 2 * 100 = 10
    render(<ThetaDecayBar theta={-0.05} dte={10} quantity={2} />);
    expect(screen.getByText('-$10/day')).toBeInTheDocument();
  });

  test('displays total remaining decay correctly', () => {
    // theta=-0.1, quantity=1 => dailyDecay = 0.1 * 1 * 100 = 10, total = 10 * 5 = 50
    render(<ThetaDecayBar theta={-0.1} dte={5} quantity={1} />);
    expect(screen.getByText('$50 left')).toBeInTheDocument();
  });
});

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Provide a mutable implementation holder so tests can swap the returned store state
let storeImpl: () => any = () => ({ data: null, isLoading: true, error: null, fetchPortfolio: vi.fn() })
vi.mock('@/store/portfolioStore', () => ({
  // The mock should behave like the real zustand hook: accept a selector function
  default: (selector: (s: any) => any) => selector(storeImpl()),
}))

// Import after mocking
import PortfolioValueCard from '../PortfolioValueCard'
import usePortfolioStore from '@/store/portfolioStore'

describe('PortfolioValueCard', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('shows loading skeleton when loading', () => {
    // Mock store to return loading
    storeImpl = () => ({
      data: null,
      isLoading: true,
      error: null,
      fetchPortfolio: vi.fn(),
    })

    render(<PortfolioValueCard />)

    expect(screen.getByText(/Loading portfolio/i)).toBeInTheDocument()
  })

  test('shows error state and retry button', async () => {
    const fetchMock = vi.fn()
    storeImpl = () => ({
      data: null,
      isLoading: false,
      error: 'Server error',
      fetchPortfolio: fetchMock,
    })

    render(<PortfolioValueCard />)

    expect(screen.getByText(/Unable to load/i)).toBeInTheDocument()
    expect(screen.getByText(/Server error/)).toBeInTheDocument()

    const btn = screen.getByRole('button', { name: /retry/i })
    await userEvent.click(btn)
    expect(fetchMock).toHaveBeenCalled()
  })

  test('shows total value and pnl when data available', () => {
    storeImpl = () => ({
      data: {
        id: 'p1',
        name: 'My Portfolio',
        cashBalance: 2000,
        positionsValue: 8000,
        totalValue: 10000,
        totalPnL: 0,
        totalPnLPercent: 0,
        positions: [],
        createdAt: '',
        updatedAt: '',
      },
      isLoading: false,
      error: null,
      fetchPortfolio: vi.fn(),
    })

    render(<PortfolioValueCard />)

    expect(screen.getByText('$10,000.00')).toBeInTheDocument()
    expect(screen.getByText(/Overall P&L/i)).toBeInTheDocument()
  })
})

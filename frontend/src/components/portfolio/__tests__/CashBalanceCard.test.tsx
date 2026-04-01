import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

// Mutable store impl so tests can change returned state per-case
let storeImpl: () => any = () => ({ data: null, isLoading: true, error: null, fetchPortfolio: vi.fn() })
vi.mock('@/store/portfolioStore', () => ({
  default: (selector: (s: any) => any) => selector(storeImpl()),
}))

import CashBalanceCard from '../CashBalanceCard'
import usePortfolioStore from '@/store/portfolioStore'

describe('CashBalanceCard', () => {
  afterEach(() => vi.resetAllMocks())

  test('shows loading skeleton when loading and no data', () => {
    storeImpl = () => ({ data: null, isLoading: true, error: null, fetchPortfolio: vi.fn() })

    render(<CashBalanceCard />)

    // The component shows a loading description
    expect(screen.getByText(/Loading cash balance/i)).toBeInTheDocument()
  })

  test('shows empty state when no option positions', () => {
    storeImpl = () => ({
      data: {
        id: 'p1',
        cashBalance: 5000,
        positionsValue: 0,
        positions: [],
      },
      isLoading: false,
      error: null,
      fetchPortfolio: vi.fn(),
    })

    render(<CashBalanceCard />)

    // Cash amount displayed
    expect(screen.getByText(/\$5,000\.00/)).toBeInTheDocument()
    // Deployed into options shows 0
    expect(screen.getByText(/Deployed into options/i)).toBeInTheDocument()
    expect(screen.getByText(/\$0\.00/)).toBeInTheDocument()
  })

  test('calculates deployed options and percent breakdown correctly', () => {
    storeImpl = () => ({
      data: {
        id: 'p1',
        cashBalance: 2000,
        positionsValue: 8000,
        positions: [
          { id: 'o1', symbol: 'AAPL', positionType: 'OPTION', optionType: 'CALL', strikePrice: 150, quantity: 1, marketValue: 2500, costBasis: 2000 },
          { id: 'o2', symbol: 'TSLA', positionType: 'OPTION', optionType: 'PUT', strikePrice: 600, quantity: 1, marketValue: 1500, costBasis: 1000 },
        ],
      },
      isLoading: false,
      error: null,
      fetchPortfolio: vi.fn(),
    })

    render(<CashBalanceCard />)

    // Cash is shown
    expect(screen.getByText(/\$2,000\.00/)).toBeInTheDocument()
    // Deployed options equals sum of option market values
    expect(screen.getByText(/\$4,000\.00/)).toBeInTheDocument()
    // Percent labels present
    expect(screen.getByText(/Cash/)).toBeInTheDocument()
    expect(screen.getByText(/Positions/)).toBeInTheDocument()
  })
})

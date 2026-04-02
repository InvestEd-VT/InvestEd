import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Input from './Input'

describe('Input component', () => {
  it('renders label and helper text when provided', () => {
    render(<Input name="email" label="Email" helperText="We will not share." />)

    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByText('We will not share.')).toBeInTheDocument()
  })

  it('shows error text and sets aria-invalid when error is present', () => {
    render(<Input name="password" label="Password" error="Required" />)

    const input = screen.getByLabelText('Password') as HTMLInputElement
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Required')
  })

  it('forwards ref to the underlying input', () => {
    const ref = React.createRef<HTMLInputElement>()
    render(<Input name="firstName" label="First name" ref={ref} />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    // focus should be callable
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })
})

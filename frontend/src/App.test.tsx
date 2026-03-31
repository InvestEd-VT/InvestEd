import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import App from './App';

// Helper to render App with a router context and an optional initial route
const renderApp = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );

describe('App', () => {
  it('redirects unauthenticated users to login', () => {
    const view = renderApp('/dashboard');
    expect(view.getAllByText(/sign in/i)[0]).toBeInTheDocument();
  });

  it('renders the forgot password page on /forgot-password', () => {
    const view = renderApp('/forgot-password');
    expect(view.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it('redirects unknown paths to login for unauthenticated users', () => {
    const view = renderApp('/some/unknown/path');
    expect(view.getAllByText(/sign in/i)[0]).toBeInTheDocument();
  });
});

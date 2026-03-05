import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../services';

type Status = 'idle' | 'loading' | 'success' | 'error';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email is required.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email address.');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) return;

    setStatus('loading');
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
    } catch (err) {
      // Show success even if the backend returns 4xx (e.g. email not found).
      // This prevents email enumeration — users should never know if an email exists.
      // Only show an error on a true network failure (no response received).
      if (axios.isAxiosError(err) && !err.response) {
        setStatus('error');
      } else {
        setStatus('success');
      }
    }
  };

  const isSubmitting = status === 'loading';

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-zinc-50 tracking-tight">
            Forgot your password?
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">

          {/* Success state */}
          {status === 'success' ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <svg
                  className="h-6 w-6 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-50">Check your email</p>
                <p className="mt-1 text-sm text-zinc-400">
                  If an account exists for <span className="text-zinc-200">{email}</span>, a
                  password reset link has been sent.
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block text-sm text-zinc-400 hover:text-zinc-50 transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Error banner */}
              {status === 'error' && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-400">
                    Something went wrong. Please try again later.
                  </p>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-zinc-200">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) validateEmail(e.target.value);
                  }}
                  disabled={isSubmitting}
                  placeholder="johndoe@example.com"
                  className={`
                    w-full rounded-lg border bg-zinc-800 px-3 py-2 text-sm text-zinc-50
                    placeholder:text-zinc-500
                    focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
                    disabled:cursor-not-allowed disabled:opacity-50
                    transition-colors
                    ${emailError ? 'border-red-500/70' : 'border-zinc-700 hover:border-zinc-600'}
                  `}
                />
                {emailError && (
                  <p className="text-xs text-red-400">{emailError}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900
                  hover:bg-zinc-200 active:bg-zinc-300
                  focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
                  disabled:cursor-not-allowed disabled:opacity-50
                  transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12" cy="12" r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Back to login */}
              <p className="text-center text-sm text-zinc-500">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-zinc-300 hover:text-zinc-50 transition-colors"
                >
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

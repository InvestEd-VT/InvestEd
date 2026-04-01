import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services';

type Status = 'idle' | 'loading' | 'success' | 'error';

const VerifyEmail = () => {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setMessage('Please check your email for a verification link.');
      return;
    }

    const verify = async () => {
      setStatus('loading');
      try {
        const res = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Email verified successfully.');
        setTimeout(() => navigate('/login'), 5000);
      } catch (err: any) {
        setStatus('error');
        setMessage(
          err?.response?.data?.message || 'Verification failed. Token may be invalid or expired.'
        );
      }
    };

    verify();
  }, [token, navigate]);

  const handleResend = async () => {
    if (!token) {
      setMessage('Invalid session. Please register again.');
      return;
    }

    try {
      setResending(true);
      await authService.resendVerification({ token });
      setMessage('A new verification email has been sent.');
    } catch (err: any) {
      setMessage('Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-xl p-8 text-center">
        {/* no verification email sent yet */}
        {status === 'idle' && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-blue-400">Check Your Email</h1>
            <p className="text-zinc-300 text-sm">
              A verification link has been sent to your email.
            </p>
            <p className="text-zinc-400 text-xs">
              Click the link in your email to activate your account.
            </p>
            <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-200 mt-2">
              Back to Login
            </Link>
          </div>
        )}

        {/* loading */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-300 text-sm">Verifying your email...</p>
          </div>
        )}

        {/* verification success */}
        {status === 'success' && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-green-400">Email Verified</h1>
            <p className="text-zinc-300 text-sm">{message}</p>
            <p className="text-xs text-zinc-500">Redirecting to login...</p>
            <Link
              to="/login"
              className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-lg text-zinc-50 font-medium"
            >
              Go to Login Now
            </Link>
          </div>
        )}

        {/* verification failed */}
        {status === 'error' && (
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-semibold text-red-400">Verification Failed</h1>
            <p className="text-zinc-300 text-sm">{message}</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-lg text-zinc-50 font-medium disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
            <Link to="/login" className="text-sm text-zinc-400 hover:text-zinc-200 mt-2">
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

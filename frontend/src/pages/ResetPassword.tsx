import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authService } from '../services';
import { isValidPassword } from '../utils/validation';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token');

  useEffect(() => {
    if (!resetToken) {
      setErrors(['Invalid or missing reset token.']);
    }
  }, [resetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Store errors relating to invalid password
    const newErrors: string[] = [];
    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) newErrors.push(...passwordCheck.errors);
    if (password !== confirmPassword) newErrors.push('Passwords do not match');

    // Set errors list if errors are present, or if reset token is missing
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }
    if (!resetToken) {
      setErrors(['Reset token is missing.']);
      return;
    }

    // Call API, display errors
    try {
      setIsLoading(true);
      await authService.resetPassword({ token: resetToken, newPassword: password });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        setErrors([err.message]);
      } else {
        setErrors(['Password reset failed.']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-[5vw]">
        <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-zinc-200 text-center">
          <CardHeader>
            <CardTitle>Password Reset Successful</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p>Your password has been updated successfully.</p>
            <Link to="/login">
              <Button
                className="w-full rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900
                hover:bg-zinc-200 active:bg-zinc-300
                focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
                transition-colors"
              >
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-[5vw]">
      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-zinc-200">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-zinc-400 mt-1">
                Password must be at least 8 characters, contain uppercase, lowercase, number, &
                special character
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {errors.length > 0 && (
              <div className="mt-2 mb-2 ml-2 text-red-500 text-xs space-y-1">
                {errors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900
                hover:bg-zinc-200 active:bg-zinc-300
                focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
                disabled:cursor-not-allowed disabled:opacity-50
                transition-colors"
              disabled={isLoading || !resetToken}
            >
              {isLoading ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;

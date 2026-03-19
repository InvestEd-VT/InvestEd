import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';
import { isValidEmail, isValidPassword } from '../utils/validation';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrors([]);

    // Store errors relating to invalid email or password
    const newErrors: string[] = [];
    const emailCheck = isValidEmail(email);
    if (!emailCheck.valid) newErrors.push(...emailCheck.errors);
    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.valid) newErrors.push(...passwordCheck.errors);
    if (password !== confirmPassword) newErrors.push('Passwords do not match');

    // Set errors list if errors are present
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call API, display errors
    try {
      setIsLoading(true);
      const response = await authService.register({ firstName, lastName, email, password });
      authStore.login(response.user, response.accessToken, response.refreshToken);
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof Error) {
        setErrors([error.message]);
      } else {
        setErrors(['Registration failed']);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen items-center justify-between px-[5vw] md:px-[17vw] bg-zinc-950">
      <div className="text-left mb-[5vh] md:mb-0 md:mr-6">
        <h1 className="text-4xl font-bold text-white mb-4">Register</h1>
        <p className="text-lg text-gray-400 mb-3">Already have an account?</p>
        <CardAction>
          <Link to="/login">
            <Button
              className="w-full rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900
                        hover:bg-zinc-200 active:bg-zinc-300
                        focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
                        disabled:cursor-not-allowed disabled:opacity-50
                        transition-colors"
            >
              Sign In
            </Button>
          </Link>
        </CardAction>
      </div>

      <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-zinc-200">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
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

              {errors.length > 0 && (
                <div className="mt-2 mb-2 ml-2 text-red-500 text-xs space-y-1">
                  {errors.map((err, idx) => (
                    <div key={idx}>• {err}</div>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-lg bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-900
                                hover:bg-zinc-200 active:bg-zinc-300
                                focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
                                disabled:cursor-not-allowed disabled:opacity-50
                                transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

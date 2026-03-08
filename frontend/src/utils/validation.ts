// Check if email is a valid .edu email
export function isValidEmail(email: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.edu$/i.test(email)) {
    errors.push('Email must be a valid .edu address');
  }

  return { valid: errors.length === 0, errors };
}

// Check if password is valid
export function isValidPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  if (!password) {
    return {
      valid: false,
      errors: ['Password is required'],
    };
  }

  const passwordStrengthOptions = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecial: true,
  };

  const errors: string[] = [];
  if (password.length < passwordStrengthOptions.minLength)
    errors.push(`Password must be at least ${passwordStrengthOptions.minLength} characters long`);
  if (passwordStrengthOptions.requireUppercase && !/[A-Z]/.test(password))
    errors.push('Password must contain at least one uppercase letter');
  if (passwordStrengthOptions.requireLowercase && !/[a-z]/.test(password))
    errors.push('Password must contain at least one lowercase letter');
  if (passwordStrengthOptions.requireNumber && !/\d/.test(password))
    errors.push('Password must contain at least one number');
  if (passwordStrengthOptions.requireSpecial && !/[^A-Za-z0-9_]/.test(password))
    errors.push('Password must contain at least one special character');

  return { valid: errors.length === 0, errors };
}

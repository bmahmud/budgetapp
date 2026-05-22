export interface PasswordValidationResult {
  isValid: boolean;
  message: string | null;
}

export function validatePassword(password: string): PasswordValidationResult {
  if (!password) {
    return { isValid: false, message: 'Enter a password.' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one uppercase letter.' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, message: 'Password must include at least one special character.' };
  }
  return { isValid: true, message: null };
}

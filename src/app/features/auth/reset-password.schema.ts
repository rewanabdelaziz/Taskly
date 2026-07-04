import * as z from 'zod';

// regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,64}$/;

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .nonempty('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password cannot exceed 64 characters')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase, one lowercase, one number, and one special character',
      ),

    confirmPassword: z.string().nonempty('Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], //to ref the error msg to confirmPassword input
  });

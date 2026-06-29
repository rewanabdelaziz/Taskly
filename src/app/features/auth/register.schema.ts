import * as z from 'zod';

// regex
const nameRegex = /^[a-zA-Z\u0600-\u06FF]+( [a-zA-Z\u0600-\u06FF]+)*$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,64}$/;

export const RegisterSchema = z
  .object({
    email: z.email({ message: 'Invalid email format' }).min(1, 'Email is required'),

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

    data: z.object({
      name: z
        .string()
        .nonempty('Name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .regex(nameRegex, 'Name can only contain letters and single spaces between names'),

      department: z.string().optional(),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], //to ref the error msg to confirmPassword input
  });

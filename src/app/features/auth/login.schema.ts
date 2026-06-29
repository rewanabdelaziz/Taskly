import * as z from 'zod';

export const LoginSchema = z.object({
  email: z.email({ message: 'Invalid email format' }).min(1, 'Email is required'),

  password: z.string().nonempty('Password is required'),
});

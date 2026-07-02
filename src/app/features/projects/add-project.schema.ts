import * as z from 'zod';

export const AddProjectSchema = z.object({
  name: z.string().
          nonempty('Name is required').
          min(3, 'name must be atleat 3 chars').
          max(100, 'name must be atmost 100 chars'),

  description: z.string().
               min(0).
               max(500, 'Description must be atmost 200 chars'),
});

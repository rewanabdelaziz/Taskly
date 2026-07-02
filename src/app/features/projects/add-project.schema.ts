import * as z from 'zod';

export const AddProjectSchema = z.object({
  name: z.string("name is required").
          nonempty('Name is required').
          min(3, 'name must be at leat 3 chars').
          max(100, 'name must be at most 100 chars'),

  description: z.string().
               min(0).
               max(500, 'Description must be atmost 200 chars'),
});

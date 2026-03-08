import type z from 'zod';

export function validateParams<T extends z.ZodType>(schema: T, params: unknown): z.infer<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    throw new Response('Invalid Route Parameters', { status: 400 });
  }

  return result.data;
}

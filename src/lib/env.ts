import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().startsWith('mongodb')),
  AUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
})

function parseEnv() {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    console.error(
      'Invalid environment variables:',
      parsed.error.flatten().fieldErrors,
    )
    throw new Error('Invalid environment variables')
  }
  return parsed.data
}

export const env = parseEnv()

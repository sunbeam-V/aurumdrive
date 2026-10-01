import {z} from 'zod';

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

export function serverEnv() {
  return serverSchema.parse({
    DATABASE_URL: process.env['DATABASE_URL'],
    SESSION_SECRET: process.env['SESSION_SECRET'],
    NODE_ENV: process.env['NODE_ENV']
  });
}

export const publicEnv = {
  yandexMetrikaId: process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL
};
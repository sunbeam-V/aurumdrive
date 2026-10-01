import {createHmac, randomBytes} from 'node:crypto';
import {cookies} from 'next/headers';
import {safeEqual} from './session';

const COOKIE = 'aurum_csrf';

function secret() {
  const value = process.env['SESSION_SECRET'] ?? process.env['DATABASE_URL'];
  if (!value) throw new Error('SESSION_SECRET is not configured');
  return value;
}

function sign(value: string) {
  return createHmac('sha256', secret()).update(value).digest('base64url');
}

export async function issueCsrfToken() {
  const value = randomBytes(24).toString('base64url');
  const token = `${value}.${sign(value)}`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: false,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/'
  });
  return token;
}

export async function verifyCsrfToken(header: string | null) {
  if (!header) return false;
  const cookie = (await cookies()).get(COOKIE)?.value;
  if (!cookie || !safeEqual(cookie, header)) return false;
  const [value, signature] = cookie.split('.');
  return Boolean(value && signature && safeEqual(signature, sign(value)));
}
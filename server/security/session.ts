import {createHash, randomBytes, timingSafeEqual} from 'node:crypto';
import bcrypt from 'bcryptjs';
import {and, eq, gt, isNull} from 'drizzle-orm';
import {cookies} from 'next/headers';
import {getDb} from '@/server/db/client';
import {sessions, users} from '@/server/db/schema';
import {createId} from '@/lib/utils';

export const SESSION_COOKIE = 'aurum_admin_session';
export type AdminRole = 'superadmin' | 'manager';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const raw = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000);
  await getDb().insert(sessions).values({
    id: createId(),
    userId,
    tokenHash: hashToken(raw),
    expiresAt
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, raw, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt
  });
}

export async function revokeSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    await getDb()
      .update(sessions)
      .set({revokedAt: new Date()})
      .where(and(eq(sessions.tokenHash, hashToken(raw)), isNull(sessions.revokedAt)));
  }
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentAdmin() {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const rows = await getDb()
    .select({id: users.id, email: users.email, role: users.role, active: users.active})
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(
      eq(sessions.tokenHash, hashToken(raw)),
      isNull(sessions.revokedAt),
      gt(sessions.expiresAt, new Date()),
      eq(users.active, true)
    ))
    .limit(1);
  return rows[0] ?? null;
}

export async function requireAdmin(role?: AdminRole) {
  const admin = await getCurrentAdmin();
  if (!admin || (role === 'superadmin' && admin.role !== 'superadmin')) {
    throw new Error('UNAUTHORIZED');
  }
  return admin;
}

export function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
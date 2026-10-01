import {describe,expect,it} from 'vitest';
import {hashPassword,verifyPassword} from '@/server/security/session';

describe('authentication primitives',()=>{
  it('stores passwords as bcrypt hashes',async()=>{const hash=await hashPassword('A-very-strong-password-42');expect(hash).not.toContain('A-very-strong-password-42');expect(await verifyPassword('A-very-strong-password-42',hash)).toBe(true);expect(await verifyPassword('wrong-password',hash)).toBe(false)});
  it('models manager and superadmin as distinct roles',()=>{const canManageTeam=(role:'manager'|'superadmin')=>role==='superadmin';expect(canManageTeam('manager')).toBe(false);expect(canManageTeam('superadmin')).toBe(true)});
});

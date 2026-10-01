import {NextResponse} from 'next/server';
import {verifyCsrfToken} from '@/server/security/csrf';
import {revokeSession} from '@/server/security/session';

export async function POST(request:Request){
  if(!await verifyCsrfToken(request.headers.get('x-csrf-token'))) return NextResponse.json({error:'Invalid CSRF token'},{status:403});
  await revokeSession();
  return NextResponse.json({ok:true});
}

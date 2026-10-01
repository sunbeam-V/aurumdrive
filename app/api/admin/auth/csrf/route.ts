import {NextResponse} from 'next/server';
import {issueCsrfToken} from '@/server/security/csrf';
import {requireAdmin} from '@/server/security/session';

export async function GET(){
  try {await requireAdmin();return NextResponse.json({token:await issueCsrfToken()},{headers:{'Cache-Control':'private, no-store'}});} catch{return NextResponse.json({error:'Unauthorized'},{status:401});}
}

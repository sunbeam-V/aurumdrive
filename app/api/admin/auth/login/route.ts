import {createHash} from 'node:crypto';
import {eq} from 'drizzle-orm';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getDb} from '@/server/db/client';
import {auditLogs,loginEvents,users} from '@/server/db/schema';
import {consumeRateLimit} from '@/server/security/rate-limit';
import {createSession,verifyPassword} from '@/server/security/session';
import {createId} from '@/lib/utils';

const inputSchema=z.object({email:z.email().max(191),password:z.string().min(10).max(200)});
const dummyHash='$2a$12$C6UzMDM.H6dfI/f/IKcEe.9GAd8JEOL7GJQGdDgT3LMhC5G4h8sze';

export async function POST(request:Request){
  try{
    const body=inputSchema.safeParse(await request.json().catch(()=>null));
    if(!body.success)return NextResponse.json({error:'Неверный email или пароль'},{status:401});
    const email=body.data.email.trim().toLowerCase();
    const ip=request.headers.get('x-forwarded-for')?.split(',')[0]??'unknown';
    if(!await consumeRateLimit(`login:${ip}:${email}`,8,15*60*1000))return NextResponse.json({error:'Слишком много попыток. Попробуйте позже.'},{status:429});
    const user=(await getDb().select().from(users).where(eq(users.email,email)).limit(1))[0];
    const valid=await verifyPassword(body.data.password,user?.passwordHash??dummyHash);
    const success=Boolean(user?.active&&valid);
    await getDb().insert(loginEvents).values({id:createId(),userId:user?.id,emailHash:createHash('sha256').update(email).digest('hex'),ipHash:createHash('sha256').update(ip).digest('hex'),userAgent:request.headers.get('user-agent')?.slice(0,500),success});
    if(!success)return NextResponse.json({error:'Неверный email или пароль'},{status:401});
    await createSession(user.id);
    await getDb().update(users).set({lastLoginAt:new Date()}).where(eq(users.id,user.id));
    await getDb().insert(auditLogs).values({id:createId(),actorId:user.id,action:'auth.login',entityType:'session',metadata:{success:true}});
    return NextResponse.json({ok:true,role:user.role});
  }catch{
    return NextResponse.json({error:'Сервис авторизации временно недоступен. Попробуйте ещё раз.'},{status:503});
  }
}

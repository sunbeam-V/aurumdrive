import {NextResponse} from 'next/server';
import {quoteSchema} from '@/features/requests/schema';
import {quote} from '@/server/services/request-service';
import {consumeRateLimit} from '@/server/security/rate-limit';

export async function POST(request:Request){
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]??'unknown';
  if(!await consumeRateLimit(`quote:${ip}`,30,10*60*1000)) return NextResponse.json({error:'Too many requests'},{status:429});
  const parsed=quoteSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:'Invalid request',issues:parsed.error.flatten()},{status:400});
  return NextResponse.json(await quote(parsed.data),{headers:{'Cache-Control':'private, no-store'}});
}

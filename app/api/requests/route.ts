import {NextResponse} from 'next/server';
import {requestSchema} from '@/features/requests/schema';
import {createRequest} from '@/server/services/request-service';

export async function POST(request:Request){
  const parsed=requestSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:'Invalid request',issues:parsed.error.flatten()},{status:400});
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]??'unknown';
  try { return NextResponse.json(await createRequest(parsed.data,`${ip}:${parsed.data.phone}`),{status:201,headers:{'Cache-Control':'private, no-store'}}); }
  catch(error){
    const message=error instanceof Error?error.message:'UNKNOWN';
    if(message==='RATE_LIMITED') return NextResponse.json({error:'Too many requests'},{status:429});
    return NextResponse.json({error:'Service temporarily unavailable'},{status:503});
  }
}

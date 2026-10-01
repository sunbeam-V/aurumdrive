import {NextResponse} from 'next/server';
import {listPublishedVehicles} from '@/server/repositories/fleet';

export async function GET(){
  return NextResponse.json(await listPublishedVehicles(),{headers:{'Cache-Control':'public, max-age=60, stale-while-revalidate=300'}});
}

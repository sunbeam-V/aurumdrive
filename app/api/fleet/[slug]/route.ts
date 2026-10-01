import {NextResponse} from 'next/server';
import {getPublishedVehicle} from '@/server/repositories/fleet';

export async function GET(_:Request,{params}:{params:Promise<{slug:string}>}){
  const {slug}=await params; const vehicle=await getPublishedVehicle(slug);
  return vehicle?NextResponse.json(vehicle):NextResponse.json({error:'Not found'},{status:404});
}

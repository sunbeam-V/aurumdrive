import {createHash} from 'node:crypto';
import {calculateQuote, serviceMultipliers} from '@/features/pricing/domain';
import {normalizePhone, type RequestInput, type QuoteInput} from '@/features/requests/schema';
import {vehicles} from '@/lib/site-data';
import {createId,createPublicId,safeJson} from '@/lib/utils';
import {getDb,hasDatabase} from '@/server/db/client';
import {extrasTable,outboxEvents,pricingRules,requestHistory,requests} from '@/server/db/schema';
import {and,eq} from 'drizzle-orm';
import {getPublishedVehicle} from '@/server/repositories/fleet';
import {consumeRateLimit} from '@/server/security/rate-limit';

const extrasPrice:Record<string,number>={'child-seat':1000,'meet-sign':1500,'extra-stop':1200};

export async function quote(input:QuoteInput){
  const selected=input.vehicleSlug?await getPublishedVehicle(input.vehicleSlug):null;
  const fallback=vehicles.find((v)=>v.passengers>=3)??vehicles[0];
  const vehicle=selected??fallback;
  let hourlyRate=vehicle.hourlyRate;let minimumHours=vehicle.minHours;let serviceMultiplier=serviceMultipliers[input.serviceType]??1;let prices=extrasPrice;
  if(hasDatabase()){
    const db=getDb();
    const rule=(await db.select().from(pricingRules).where(and(eq(pricingRules.enabled,true),eq(pricingRules.serviceType,input.serviceType))).orderBy(pricingRules.createdAt).limit(1))[0];
    if(rule){hourlyRate=rule.hourlyRate??hourlyRate;minimumHours=rule.minimumHours??minimumHours;serviceMultiplier=Number(rule.multiplier)||serviceMultiplier;}
    const extraRows=await db.select().from(extrasTable).where(eq(extrasTable.enabled,true));
    if(extraRows.length)prices=Object.fromEntries(extraRows.map((row)=>[row.code,row.value]));
  }
  return calculateQuote({hourlyRate,minimumHours,durationHours:input.durationHours,serviceMultiplier,dateMultiplier:1,extras:input.extras.map((code)=>prices[code]??0)});
}

export async function createRequest(input:RequestInput,clientKey:string){
  if(!hasDatabase()) throw new Error('SERVICE_UNAVAILABLE');
  const allowed=await consumeRateLimit(`request:${createHash('sha256').update(clientKey).digest('hex')}`,5,60*60*1000);
  if(!allowed) throw new Error('RATE_LIMITED');
  const calculation=await quote(input);
  const vehicle=input.vehicleSlug?await getPublishedVehicle(input.vehicleSlug):null;
  const requestId=createId(); const publicId=createPublicId();
  const scheduledAt=new Date(`${input.date}T${input.time}:00`);
  await getDb().transaction(async(tx)=>{
    await tx.insert(requests).values({id:requestId,publicId,name:input.name,phone:normalizePhone(input.phone),serviceType:input.serviceType,scheduledAt,durationHours:input.durationHours,passengers:input.passengers,luggage:input.luggage,vehicleId:vehicle?.id,comment:input.comment||null,locale:input.locale,consentVersion:'2026-09-30',consentAt:new Date(),calculationSnapshot:safeJson(calculation)});
    await tx.insert(requestHistory).values({id:createId(),requestId,action:'request.created',newValue:safeJson({status:'new',source:'website'})});
    await tx.insert(outboxEvents).values({id:createId(),eventType:'request.created',aggregateId:requestId,payload:safeJson({requestId,publicId,locale:input.locale})});
  });
  return {publicId,calculation};
}

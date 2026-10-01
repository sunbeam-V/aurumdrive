import {eq} from 'drizzle-orm';
import {getDb, hasDatabase} from '@/server/db/client';
import {rateLimits} from '@/server/db/schema';

const memory=new Map<string,{count:number;windowStart:number}>();

export async function consumeRateLimit(key:string,limit:number,windowMs:number){
  const now=Date.now();
  if(!hasDatabase()){
    const current=memory.get(key);
    if(!current||now-current.windowStart>=windowMs){memory.set(key,{count:1,windowStart:now});return true;}
    if(current.count>=limit)return false;
    current.count+=1; return true;
  }
  const db=getDb();
  return db.transaction(async(tx)=>{
    const row=(await tx.select().from(rateLimits).where(eq(rateLimits.key,key)).limit(1))[0];
    if(!row){await tx.insert(rateLimits).values({key,count:1,windowStart:new Date(now)});return true;}
    if(now-row.windowStart.getTime()>=windowMs){await tx.update(rateLimits).set({count:1,windowStart:new Date(now)}).where(eq(rateLimits.key,key));return true;}
    if(row.count>=limit)return false;
    await tx.update(rateLimits).set({count:row.count+1}).where(eq(rateLimits.key,key));
    return true;
  });
}

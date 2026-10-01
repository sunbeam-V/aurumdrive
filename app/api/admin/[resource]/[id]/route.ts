import {and,count,eq} from 'drizzle-orm';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {createId} from '@/lib/utils';
import {getDb} from '@/server/db/client';
 import {auditLogs,contentPages,faqsTable,pricingRules,requestComments,requestHistory,requests,sessions,siteSettings,users,vehicleImages,vehiclesTable} from '@/server/db/schema';
import {verifyCsrfToken} from '@/server/security/csrf';
import {requireAdmin} from '@/server/security/session';

const statusSchema=z.enum(['new','in_progress','awaiting_details','confirmed','completed','cancelled','archived']);

export async function PATCH(request:Request,{params}:{params:Promise<{resource:string;id:string}>}){
  try{
    const admin=await requireAdmin(); const {resource,id}=await params;
    if(!await verifyCsrfToken(request.headers.get('x-csrf-token')))return NextResponse.json({error:'Invalid CSRF token'},{status:403});
    const body=await request.json(); const db=getDb();
    if(resource==='requests'){
      const data=z.object({status:statusSchema.optional(),comment:z.string().trim().min(1).max(2000).optional()}).parse(body);
      const current=(await db.select().from(requests).where(eq(requests.id,id)).limit(1))[0]; if(!current)return NextResponse.json({error:'Not found'},{status:404});
      await db.transaction(async(tx)=>{
        if(data.status&&data.status!==current.status){await tx.update(requests).set({status:data.status}).where(eq(requests.id,id));await tx.insert(requestHistory).values({id:createId(),requestId:id,actorId:admin.id,action:'status.changed',previousValue:{status:current.status},newValue:{status:data.status}});}
        if(data.comment){await tx.insert(requestComments).values({id:createId(),requestId:id,authorId:admin.id,body:data.comment});await tx.insert(requestHistory).values({id:createId(),requestId:id,actorId:admin.id,action:'comment.added',newValue:{length:data.comment.length}});}
      });
    } else if(resource==='managers'){
      if(admin.role!=='superadmin')return NextResponse.json({error:'Forbidden'},{status:403});
      const data=z.object({active:z.boolean()}).parse(body); const target=(await db.select().from(users).where(eq(users.id,id)).limit(1))[0]; if(!target)return NextResponse.json({error:'Not found'},{status:404});
      if(!data.active&&target.role==='superadmin'){
        const active=(await db.select({value:count()}).from(users).where(and(eq(users.role,'superadmin'),eq(users.active,true))))[0]?.value??0;
        if(target.id===admin.id||active<=1)return NextResponse.json({error:'Нельзя деактивировать последнего активного суперадминистратора'},{status:409});
      }
      await db.transaction(async(tx)=>{await tx.update(users).set({active:data.active}).where(eq(users.id,id));if(!data.active)await tx.update(sessions).set({revokedAt:new Date()}).where(eq(sessions.userId,id));});
    } else if(resource==='fleet'){
      const data=z.object({hourlyRate:z.number().int().positive().optional(),minHours:z.number().int().min(1).optional(),available:z.boolean().optional(),published:z.boolean().optional(),titleRu:z.string().min(2).optional(),titleEn:z.string().min(2).optional(),descriptionRu:z.string().min(10).optional(),descriptionEn:z.string().min(10).optional(),imageUrl:z.string().url().or(z.string().startsWith('/')).optional()}).parse(body);
      const {imageUrl,...vehicleData}=data;await db.update(vehiclesTable).set(vehicleData).where(eq(vehiclesTable.id,id));
      if(imageUrl){const existing=(await db.select({id:vehicleImages.id}).from(vehicleImages).where(eq(vehicleImages.vehicleId,id)).limit(1))[0];if(existing)await db.update(vehicleImages).set({url:imageUrl}).where(eq(vehicleImages.id,existing.id));else await db.insert(vehicleImages).values({id:createId(),vehicleId:id,url:imageUrl,altRu:'Автомобиль с водителем',altEn:'Chauffeur-driven vehicle',width:1600,height:1067,sortOrder:0,cover:true});}
    } else if(resource==='pricing'){
      if(admin.role!=='superadmin')return NextResponse.json({error:'Forbidden'},{status:403});
      const data=z.object({enabled:z.boolean().optional(),hourlyRate:z.number().int().positive().nullable().optional(),minimumHours:z.number().int().min(1).nullable().optional(),multiplier:z.string().optional()}).parse(body);
      await db.update(pricingRules).set(data).where(eq(pricingRules.id,id));
    } else if(resource==='faq'){
      if(admin.role!=='superadmin')return NextResponse.json({error:'Forbidden'},{status:403});
      const data=z.object({enabled:z.boolean().optional(),questionRu:z.string().min(2).optional(),questionEn:z.string().min(2).optional(),answerRu:z.string().min(2).optional(),answerEn:z.string().min(2).optional()}).parse(body);
      await db.update(faqsTable).set(data).where(eq(faqsTable.id,id));
    } else if(resource==='content'){
      if(admin.role!=='superadmin')return NextResponse.json({error:'Forbidden'},{status:403});
      const data=z.object({title:z.string().min(2).optional(),sections:z.unknown().optional(),published:z.boolean().optional()}).parse(body);
      await db.update(contentPages).set({...data,sections:data.sections===undefined?undefined:JSON.stringify(data.sections)}).where(eq(contentPages.id,id));
    } else if(resource==='settings'){
      if(admin.role!=='superadmin')return NextResponse.json({error:'Forbidden'},{status:403});
      const data=z.object({value:z.unknown()}).parse(body);
      await db.update(siteSettings).set({value:JSON.stringify(data.value)}).where(eq(siteSettings.key,id));
    } else return NextResponse.json({error:'Not found'},{status:404});
    await db.insert(auditLogs).values({id:createId(),actorId:admin.id,action:`${resource}.update`,entityType:resource,entityId:id,metadata:{fields:Object.keys(body)}});
    return NextResponse.json({ok:true});
  }catch(error){return NextResponse.json({error:error instanceof z.ZodError?error.flatten():'Request failed'},{status:error instanceof z.ZodError?400:401});}
}

export async function DELETE(request:Request,{params}:{params:Promise<{resource:string;id:string}>}){
  try{const admin=await requireAdmin();if(admin.role!=='superadmin')return NextResponse.json({error:'Forbidden'},{status:403});if(!await verifyCsrfToken(request.headers.get('x-csrf-token')))return NextResponse.json({error:'Invalid CSRF token'},{status:403});const {resource,id}=await params;const db=getDb();if(resource==='faq')await db.delete(faqsTable).where(eq(faqsTable.id,id));else if(resource==='content')await db.delete(contentPages).where(eq(contentPages.id,id));else if(resource==='pricing')await db.delete(pricingRules).where(eq(pricingRules.id,id));else if(resource==='settings')await db.delete(siteSettings).where(eq(siteSettings.key,id));else return NextResponse.json({error:'Not found'},{status:404});await db.insert(auditLogs).values({id:createId(),actorId:admin.id,action:`${resource}.delete`,entityType:resource,entityId:id,metadata:{}});return NextResponse.json({ok:true});}catch{return NextResponse.json({error:'Request failed'},{status:400});}
}

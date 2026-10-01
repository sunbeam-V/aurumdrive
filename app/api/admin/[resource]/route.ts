import {desc} from 'drizzle-orm';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {getDb} from '@/server/db/client';
import {auditLogs,contentPages,faqsTable,pricingRules,requests,siteSettings,users,vehicleImages,vehiclesTable} from '@/server/db/schema';
import {verifyCsrfToken} from '@/server/security/csrf';
import {hashPassword,requireAdmin} from '@/server/security/session';
import {createId,safeJson} from '@/lib/utils';

const resourceNames=['requests','fleet','managers','pricing','content','faq','settings','audit'] as const;
type Resource=typeof resourceNames[number];
function isResource(value:string):value is Resource{return resourceNames.includes(value as Resource);}

async function tableFor(resource:Resource,role:'superadmin'|'manager'){
  const db=getDb();
  if(resource==='requests')return db.select().from(requests).orderBy(desc(requests.createdAt)).limit(100);
  if(resource==='fleet')return db.select().from(vehiclesTable).orderBy(vehiclesTable.sortOrder);
  if(resource==='audit')return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(200);
  if(role!=='superadmin')throw new Error('FORBIDDEN');
  if(resource==='managers')return db.select({id:users.id,email:users.email,role:users.role,active:users.active,createdAt:users.createdAt,lastLoginAt:users.lastLoginAt}).from(users);
  if(resource==='pricing')return db.select().from(pricingRules);
  if(resource==='content')return db.select().from(contentPages);
  if(resource==='faq')return db.select().from(faqsTable).orderBy(faqsTable.sortOrder);
  return db.select().from(siteSettings);
}

export async function GET(_:Request,{params}:{params:Promise<{resource:string}>}){
  try{const admin=await requireAdmin();const {resource}=await params;if(!isResource(resource))return NextResponse.json({error:'Not found'},{status:404});return NextResponse.json(await tableFor(resource,admin.role),{headers:{'Cache-Control':'private, no-store'}});}catch(error){return NextResponse.json({error:error instanceof Error&&error.message==='FORBIDDEN'?'Forbidden':'Unauthorized'},{status:error instanceof Error&&error.message==='FORBIDDEN'?403:401});}
}

export async function POST(request:Request,{params}:{params:Promise<{resource:string}>}){
  try{
    const admin=await requireAdmin(); const {resource}=await params;
    if(!isResource(resource)||['requests','audit'].includes(resource))return NextResponse.json({error:'Not found'},{status:404});
    if(!await verifyCsrfToken(request.headers.get('x-csrf-token')))return NextResponse.json({error:'Invalid CSRF token'},{status:403});
    if(resource!=='fleet'&&admin.role!=='superadmin')return NextResponse.json({error:'Forbidden'},{status:403});
    const body=await request.json(); const db=getDb(); const id=createId();
    if(resource==='managers'){
      const data=z.object({email:z.email(),password:z.string().min(12),role:z.enum(['superadmin','manager']).default('manager')}).parse(body);
      await db.insert(users).values({id,email:data.email.toLowerCase(),passwordHash:await hashPassword(data.password),role:data.role});
    } else if(resource==='fleet'){
      const data=z.object({slug:z.string().min(3).max(100),brand:z.string().min(1),model:z.string().min(1),year:z.coerce.number().int().min(2000).max(2035),vehicleClass:z.enum(['business','executive','minivan','suv','event','minibus','coach']),passengers:z.coerce.number().int().min(1),luggage:z.coerce.number().int().min(0),titleRu:z.string().min(2),titleEn:z.string().min(2),descriptionRu:z.string().min(10),descriptionEn:z.string().min(10),hourlyRate:z.coerce.number().int().positive(),minHours:z.coerce.number().int().min(1),published:z.boolean().default(false),imageUrl:z.string().url().or(z.string().startsWith('/')).optional()}).parse(body);
      const {imageUrl,...vehicleData}=data;await db.insert(vehiclesTable).values({...vehicleData,id,equipment:[],driverFeatures:[],sortOrder:100});
      if(imageUrl)await db.insert(vehicleImages).values({id:createId(),vehicleId:id,url:imageUrl,altRu:`${data.titleRu}, автомобиль с водителем`,altEn:`${data.titleEn}, chauffeur-driven vehicle`,width:1600,height:1067,sortOrder:0,cover:true});
    } else if(resource==='pricing'){
      const data=z.object({name:z.string().min(2),vehicleClass:z.string().nullable().optional(),serviceType:z.string().nullable().optional(),hourlyRate:z.number().int().positive().nullable().optional(),minimumHours:z.number().int().min(1).nullable().optional(),multiplier:z.coerce.string().default('1.000')}).parse(body);
      await db.insert(pricingRules).values({...data,id});
    } else if(resource==='content'){
      const data=z.object({routeKey:z.string().min(1),locale:z.enum(['ru','en']),title:z.string().min(2),sections:z.unknown(),published:z.boolean().default(true)}).parse(body);
      await db.insert(contentPages).values({...data,id,sections:safeJson(data.sections)});
    } else if(resource==='faq'){
      const data=z.object({questionRu:z.string().min(2),questionEn:z.string().min(2),answerRu:z.string().min(2),answerEn:z.string().min(2),sortOrder:z.number().int().default(0)}).parse(body);
      await db.insert(faqsTable).values({...data,id});
    } else {
      const data=z.object({key:z.string().min(1),value:z.unknown()}).parse(body);
      await db.insert(siteSettings).values({key:data.key,value:safeJson(data.value)}).onDuplicateKeyUpdate({set:{value:safeJson(data.value)}});
    }
    await db.insert(auditLogs).values({id:createId(),actorId:admin.id,action:`${resource}.create`,entityType:resource,entityId:id,metadata:{fields:Object.keys(body)}});
    return NextResponse.json({ok:true,id},{status:201});
  }catch(error){return NextResponse.json({error:error instanceof z.ZodError?error.flatten():'Request failed'},{status:error instanceof z.ZodError?400:401});}
}

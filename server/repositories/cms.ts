import {and,asc,eq} from 'drizzle-orm';
import {faqsTable,siteSettings,contentPages} from '@/server/db/schema';
import {getDb,hasDatabase} from '@/server/db/client';
import {faqs,site} from '@/lib/site-data';

export async function getPublicFaqs(){
  if(!hasDatabase())return faqs;
  const rows=await getDb().select().from(faqsTable).where(eq(faqsTable.enabled,true)).orderBy(asc(faqsTable.sortOrder));
  return rows.map(row=>({q:{ru:row.questionRu,en:row.questionEn},a:{ru:row.answerRu,en:row.answerEn}}));
}
export async function getPublicSettings(){
  if(!hasDatabase())return site;
  const rows=await getDb().select().from(siteSettings);
  const values=Object.fromEntries(rows.map(row=>[row.key,row.value]));
  return {...site,...values,phoneHref:typeof values.phone==='string'?`tel:${values.phone.replace(/[^+\d]/g,'')}`:site.phoneHref} as typeof site;
}
export async function getPublishedPage(routeKey:string,locale:'ru'|'en'){
  if(!hasDatabase())return null;
  return (await getDb().select().from(contentPages).where(and(eq(contentPages.routeKey,routeKey),eq(contentPages.locale,locale),eq(contentPages.published,true))).limit(1))[0]??null;
}

import {getDb,getPool} from '../server/db/client';
import {contentPages,extrasTable,faqsTable,pricingRules,seoEntries,siteSettings,vehicleImages,vehiclesTable} from '../server/db/schema';
import {faqs,site,vehicles} from '../lib/site-data';

async function main(){
  const db=getDb();
  for(const [sortOrder,v] of vehicles.entries()){
    await db.insert(vehiclesTable).values({id:v.id,slug:v.slug,brand:v.brand,model:v.model,year:v.year,vehicleClass:v.vehicleClass,passengers:v.passengers,luggage:v.luggage,titleRu:v.title.ru,titleEn:v.title.en,descriptionRu:v.description.ru,descriptionEn:v.description.en,hourlyRate:v.hourlyRate,minHours:v.minHours,available:true,published:true,equipment:[...v.equipment],driverFeatures:['Business etiquette','Confidentiality'],sortOrder}).onDuplicateKeyUpdate({set:{titleRu:v.title.ru,titleEn:v.title.en,descriptionRu:v.description.ru,descriptionEn:v.description.en}});
    await db.insert(vehicleImages).values({id:`img-${v.id}`,vehicleId:v.id,url:v.image,altRu:`${v.title.ru}, автомобиль с водителем`,altEn:`${v.title.en}, chauffeur-driven vehicle`,width:1600,height:1067,sortOrder:0,cover:true}).onDuplicateKeyUpdate({set:{url:v.image}});
  }
  for(const [sortOrder,item] of faqs.entries()) await db.insert(faqsTable).values({id:`faq-${sortOrder+1}`,questionRu:item.q.ru,questionEn:item.q.en,answerRu:item.a.ru,answerEn:item.a.en,sortOrder,enabled:true}).onDuplicateKeyUpdate({set:{questionRu:item.q.ru,questionEn:item.q.en,answerRu:item.a.ru,answerEn:item.a.en}});
  const extras=[['child-seat','Детское кресло','Child seat',1000],['meet-sign','Встреча с табличкой','Meet & greet sign',1500],['extra-stop','Дополнительная остановка','Extra stop',1200]] as const;
  for(const [code,ru,en,value] of extras) await db.insert(extrasTable).values({id:`extra-${code}`,code,labelRu:ru,labelEn:en,value}).onDuplicateKeyUpdate({set:{labelRu:ru,labelEn:en,value}});
  const serviceRates:{service:string;rate:number;hours:number;multiplier:string}[]=[{service:'hourly',rate:5500,hours:3,multiplier:'1.000'},{service:'transfer',rate:5500,hours:3,multiplier:'1.050'},{service:'corporate',rate:6500,hours:3,multiplier:'1.000'},{service:'event',rate:10000,hours:5,multiplier:'1.200'}];
  for(const item of serviceRates) await db.insert(pricingRules).values({id:`price-${item.service}`,name:`${item.service} base rule`,serviceType:item.service,hourlyRate:item.rate,minimumHours:item.hours,multiplier:item.multiplier,enabled:true}).onDuplicateKeyUpdate({set:{hourlyRate:item.rate,minimumHours:item.hours,multiplier:item.multiplier,enabled:true}});
  for(const [key,value] of Object.entries({phone:site.phone,email:site.email,telegram:site.telegram,whatsapp:site.whatsapp,address:site.address,hours:site.hours})) await db.insert(siteSettings).values({key,value}).onDuplicateKeyUpdate({set:{value}});
  for(const locale of ['ru','en'] as const) for(const routeKey of ['home','fleet','services','transfers','corporate','about','faq','contacts','order']){
    await db.insert(contentPages).values({id:`content-${locale}-${routeKey}`,routeKey,locale,title:routeKey,sections:{version:1},published:true}).onDuplicateKeyUpdate({set:{published:true}});
    await db.insert(seoEntries).values({id:`seo-${locale}-${routeKey}`,routeKey,locale,title:`${routeKey} | Aurum Drive`,description:locale==='ru'?'Премиальная аренда автомобилей с водителем в Санкт-Петербурге.':'Premium chauffeur-driven car hire in Saint Petersburg.',keywords:locale==='ru'?'аренда авто,водитель,Санкт-Петербург':'chauffeur,car hire,Saint Petersburg'}).onDuplicateKeyUpdate({set:{description:locale==='ru'?'Премиальная аренда автомобилей с водителем в Санкт-Петербурге.':'Premium chauffeur-driven car hire in Saint Petersburg.'}});
  }
  await getPool().end();
}

main().catch(async(error)=>{
  process.stderr.write(`${error instanceof Error?error.message:String(error)}\n`);
  try{await getPool().end()}catch{}
  process.exit(1);
});

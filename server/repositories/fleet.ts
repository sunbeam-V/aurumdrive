import {asc, eq} from 'drizzle-orm';
import {vehicles} from '@/lib/site-data';
import {getDb, hasDatabase} from '@/server/db/client';
import {vehicleImages, vehiclesTable} from '@/server/db/schema';

export async function listPublishedVehicles(){
  if(!hasDatabase()) return vehicles;
  try {
    const rows=await getDb().select({id:vehiclesTable.id,slug:vehiclesTable.slug,brand:vehiclesTable.brand,model:vehiclesTable.model,year:vehiclesTable.year,vehicleClass:vehiclesTable.vehicleClass,passengers:vehiclesTable.passengers,luggage:vehiclesTable.luggage,hourlyRate:vehiclesTable.hourlyRate,minHours:vehiclesTable.minHours,titleRu:vehiclesTable.titleRu,titleEn:vehiclesTable.titleEn,descriptionRu:vehiclesTable.descriptionRu,descriptionEn:vehiclesTable.descriptionEn,equipment:vehiclesTable.equipment,image:vehicleImages.url}).from(vehiclesTable).leftJoin(vehicleImages,eq(vehicleImages.vehicleId,vehiclesTable.id)).where(eq(vehiclesTable.published,true)).orderBy(asc(vehiclesTable.sortOrder));
    if(!rows.length) return [];
    return rows.map((row)=>({id:row.id,slug:row.slug,brand:row.brand,model:row.model,year:row.year,vehicleClass:row.vehicleClass,passengers:row.passengers,luggage:row.luggage,hourlyRate:row.hourlyRate,minHours:row.minHours,image:row.image??vehicles[0].image,featured:true,title:{ru:row.titleRu,en:row.titleEn},description:{ru:row.descriptionRu,en:row.descriptionEn},equipment:row.equipment}));
  } catch { return []; }
}

export async function getPublishedVehicle(slug:string){
  const all=await listPublishedVehicles();
  return all.find((vehicle)=>vehicle.slug===slug)??null;
}

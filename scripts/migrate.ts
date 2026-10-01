import {migrate} from 'drizzle-orm/mysql2/migrator';
import {getDb,getPool} from '../server/db/client';

async function main(){
  await migrate(getDb(),{migrationsFolder:'./server/db/migrations'});
  await getPool().end();
}

main().catch(async(error)=>{
  process.stderr.write(`${error instanceof Error?error.message:String(error)}\n`);
  try{await getPool().end()}catch{}
  process.exit(1);
});

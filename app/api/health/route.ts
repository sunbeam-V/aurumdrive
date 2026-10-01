import {NextResponse} from 'next/server';
import {sql} from 'drizzle-orm';
import {getDb, hasDatabase} from '@/server/db/client';

export async function GET() {
  if (!hasDatabase()) {
    return NextResponse.json(
      {status: 'degraded', database: 'not_configured'},
      {status: 503}
    );
  }
  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({status: 'ok', database: 'connected'});
  } catch {
    return NextResponse.json(
      {status: 'degraded', database: 'unavailable'},
      {status: 503}
    );
  }
}
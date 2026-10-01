import {drizzle} from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

let pool: mysql.Pool | undefined;

function databaseUrl(): string | undefined {
  return process.env['DATABASE_URL'];
}

export function hasDatabase() {
  return Boolean(databaseUrl());
}

export function getPool() {
  const url = databaseUrl();
  if (!url) throw new Error('DATABASE_URL is not configured');
  pool ??= mysql.createPool({uri: url, connectionLimit: 5, enableKeepAlive: true});
  return pool;
}

export function getDb() {
  return drizzle(getPool(), {schema, mode: 'default'});
}
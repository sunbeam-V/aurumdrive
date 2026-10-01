import {boolean, decimal, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar} from 'drizzle-orm/mysql-core';

const uuid = (name: string) => varchar(name,{length:36});

export const users = mysqlTable('aurum_users', {
  id: uuid('id').notNull().primaryKey(), email: varchar('email',{length:191}).notNull(), passwordHash: varchar('password_hash',{length:255}).notNull(), role: mysqlEnum('role',['superadmin','manager']).notNull().default('manager'), active: boolean('active').notNull().default(true), createdAt: timestamp('created_at').notNull().defaultNow(), lastLoginAt: timestamp('last_login_at')
}, (t) => [uniqueIndex('users_email_uq').on(t.email), index('users_role_active_idx').on(t.role,t.active)]);

export const sessions = mysqlTable('aurum_sessions', {
  id:uuid('id').notNull().primaryKey(), userId:uuid('user_id').notNull().references(()=>users.id,{onDelete:'cascade'}), tokenHash:varchar('token_hash',{length:64}).notNull(), expiresAt:timestamp('expires_at').notNull(), revokedAt:timestamp('revoked_at'), createdAt:timestamp('created_at').notNull().defaultNow()
}, (t)=>[uniqueIndex('sessions_token_uq').on(t.tokenHash),index('sessions_user_exp_idx').on(t.userId,t.expiresAt)]);

export const loginEvents = mysqlTable('aurum_login_events', {
  id:uuid('id').notNull().primaryKey(), userId:uuid('user_id').references(()=>users.id,{onDelete:'set null'}), emailHash:varchar('email_hash',{length:64}).notNull(), ipHash:varchar('ip_hash',{length:64}), userAgent:varchar('user_agent',{length:500}), success:boolean('success').notNull(), createdAt:timestamp('created_at').notNull().defaultNow()
}, (t)=>[index('login_events_created_idx').on(t.createdAt)]);

export const vehiclesTable = mysqlTable('aurum_vehicles', {
  id:uuid('id').notNull().primaryKey(), slug:varchar('slug',{length:100}).notNull(), brand:varchar('brand',{length:100}).notNull(), model:varchar('model',{length:100}).notNull(), year:int('year').notNull(), vehicleClass:mysqlEnum('vehicle_class',['business','executive','minivan','suv','event','minibus','coach']).notNull(), passengers:int('passengers').notNull(), luggage:int('luggage').notNull().default(0), titleRu:varchar('title_ru',{length:180}).notNull(), titleEn:varchar('title_en',{length:180}).notNull(), descriptionRu:text('description_ru').notNull(), descriptionEn:text('description_en').notNull(), hourlyRate:int('hourly_rate').notNull(), minHours:int('min_hours').notNull(), available:boolean('available').notNull().default(true), published:boolean('published').notNull().default(false), equipment:json('equipment').$type<string[]>().notNull(), driverFeatures:json('driver_features').$type<string[]>().notNull(), sortOrder:int('sort_order').notNull().default(0), createdAt:timestamp('created_at').notNull().defaultNow(), updatedAt:timestamp('updated_at').notNull().defaultNow().onUpdateNow()
}, (t)=>[uniqueIndex('vehicles_slug_uq').on(t.slug),index('vehicles_publish_sort_idx').on(t.published,t.sortOrder),index('vehicles_class_idx').on(t.vehicleClass)]);

export const vehicleImages = mysqlTable('aurum_vehicle_images', {
  id:uuid('id').notNull().primaryKey(), vehicleId:uuid('vehicle_id').notNull().references(()=>vehiclesTable.id,{onDelete:'cascade'}), url:varchar('url',{length:1000}).notNull(), altRu:varchar('alt_ru',{length:255}).notNull(), altEn:varchar('alt_en',{length:255}).notNull(), width:int('width').notNull().default(1600), height:int('height').notNull().default(1067), sortOrder:int('sort_order').notNull().default(0), cover:boolean('cover').notNull().default(false)
}, (t)=>[index('vehicle_images_vehicle_idx').on(t.vehicleId,t.sortOrder)]);

export const pricingRules = mysqlTable('aurum_pricing_rules', {
  id:uuid('id').notNull().primaryKey(), name:varchar('name',{length:120}).notNull(), vehicleClass:varchar('vehicle_class',{length:40}), serviceType:varchar('service_type',{length:40}), hourlyRate:int('hourly_rate'), minimumHours:int('minimum_hours'), multiplier:decimal('multiplier',{precision:6,scale:3}).notNull().default('1.000'), enabled:boolean('enabled').notNull().default(true), effectiveFrom:timestamp('effective_from'), effectiveTo:timestamp('effective_to'), createdAt:timestamp('created_at').notNull().defaultNow()
}, (t)=>[index('pricing_scope_idx').on(t.vehicleClass,t.serviceType,t.enabled)]);

export const extrasTable = mysqlTable('aurum_extras', {
  id:uuid('id').notNull().primaryKey(), code:varchar('code',{length:60}).notNull(), labelRu:varchar('label_ru',{length:120}).notNull(), labelEn:varchar('label_en',{length:120}).notNull(), pricingMode:mysqlEnum('pricing_mode',['fixed','hourly']).notNull().default('fixed'), value:int('value').notNull(), enabled:boolean('enabled').notNull().default(true)
}, (t)=>[uniqueIndex('extras_code_uq').on(t.code)]);

export const requests = mysqlTable('aurum_requests', {
  id:uuid('id').notNull().primaryKey(), publicId:varchar('public_id',{length:24}).notNull(), name:varchar('name',{length:80}).notNull(), phone:varchar('phone',{length:32}).notNull(), serviceType:varchar('service_type',{length:40}).notNull(), scheduledAt:timestamp('scheduled_at').notNull(), durationHours:int('duration_hours').notNull(), passengers:int('passengers').notNull(), luggage:int('luggage'), vehicleId:uuid('vehicle_id').references(()=>vehiclesTable.id,{onDelete:'set null'}), comment:text('comment'), status:mysqlEnum('status',['new','in_progress','awaiting_details','confirmed','completed','cancelled','archived']).notNull().default('new'), locale:mysqlEnum('locale',['ru','en']).notNull().default('ru'), source:varchar('source',{length:60}).notNull().default('website'), consentVersion:varchar('consent_version',{length:30}).notNull(), consentAt:timestamp('consent_at').notNull(), calculationSnapshot:json('calculation_snapshot').notNull(), createdAt:timestamp('created_at').notNull().defaultNow(), updatedAt:timestamp('updated_at').notNull().defaultNow().onUpdateNow()
}, (t)=>[uniqueIndex('requests_public_id_uq').on(t.publicId),index('requests_status_created_idx').on(t.status,t.createdAt),index('requests_phone_idx').on(t.phone)]);

export const requestComments = mysqlTable('aurum_request_comments', {
  id:uuid('id').notNull().primaryKey(), requestId:uuid('request_id').notNull().references(()=>requests.id,{onDelete:'cascade'}), authorId:uuid('author_id').notNull().references(()=>users.id), body:text('body').notNull(), createdAt:timestamp('created_at').notNull().defaultNow()
}, (t)=>[index('request_comments_request_idx').on(t.requestId,t.createdAt)]);

export const requestHistory = mysqlTable('aurum_request_history', {
  id:uuid('id').notNull().primaryKey(), requestId:uuid('request_id').notNull().references(()=>requests.id,{onDelete:'cascade'}), actorId:uuid('actor_id').references(()=>users.id,{onDelete:'set null'}), action:varchar('action',{length:80}).notNull(), previousValue:json('previous_value'), newValue:json('new_value'), createdAt:timestamp('created_at').notNull().defaultNow()
}, (t)=>[index('request_history_request_idx').on(t.requestId,t.createdAt)]);

export const contentPages = mysqlTable('aurum_content_pages', {
  id:uuid('id').notNull().primaryKey(), routeKey:varchar('route_key',{length:100}).notNull(), locale:mysqlEnum('locale',['ru','en']).notNull(), title:varchar('title',{length:180}).notNull(), sections:json('sections').notNull(), published:boolean('published').notNull().default(true), updatedAt:timestamp('updated_at').notNull().defaultNow().onUpdateNow()
}, (t)=>[uniqueIndex('content_route_locale_uq').on(t.routeKey,t.locale)]);

export const faqsTable = mysqlTable('aurum_faqs', {
  id:uuid('id').notNull().primaryKey(), questionRu:varchar('question_ru',{length:300}).notNull(), questionEn:varchar('question_en',{length:300}).notNull(), answerRu:text('answer_ru').notNull(), answerEn:text('answer_en').notNull(), enabled:boolean('enabled').notNull().default(true), sortOrder:int('sort_order').notNull().default(0)
});

export const siteSettings = mysqlTable('aurum_site_settings', {
  key:varchar('key',{length:100}).primaryKey(), value:json('value').notNull(), updatedAt:timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

export const seoEntries = mysqlTable('aurum_seo_entries', {
  id:uuid('id').notNull().primaryKey(), routeKey:varchar('route_key',{length:100}).notNull(), locale:mysqlEnum('locale',['ru','en']).notNull(), title:varchar('title',{length:180}).notNull(), description:varchar('description',{length:320}).notNull(), keywords:varchar('keywords',{length:300})
}, (t)=>[uniqueIndex('seo_route_locale_uq').on(t.routeKey,t.locale)]);

export const auditLogs = mysqlTable('aurum_audit_logs', {
  id:uuid('id').notNull().primaryKey(), actorId:uuid('actor_id').references(()=>users.id,{onDelete:'set null'}), action:varchar('action',{length:100}).notNull(), entityType:varchar('entity_type',{length:80}).notNull(), entityId:varchar('entity_id',{length:100}), metadata:json('metadata'), createdAt:timestamp('created_at').notNull().defaultNow()
}, (t)=>[index('audit_created_idx').on(t.createdAt),index('audit_entity_idx').on(t.entityType,t.entityId)]);

export const outboxEvents = mysqlTable('aurum_outbox_events', {
  id:uuid('id').notNull().primaryKey(), eventType:varchar('event_type',{length:100}).notNull(), aggregateId:varchar('aggregate_id',{length:100}).notNull(), payload:json('payload').notNull(), status:mysqlEnum('delivery_status',['pending','processing','delivered','failed']).notNull().default('pending'), attempts:int('attempts').notNull().default(0), availableAt:timestamp('available_at').notNull().defaultNow(), processedAt:timestamp('processed_at'), createdAt:timestamp('created_at').notNull().defaultNow()
}, (t)=>[index('outbox_status_available_idx').on(t.status,t.availableAt)]);

export const rateLimits = mysqlTable('aurum_rate_limits', {
  key:varchar('key',{length:191}).primaryKey(), count:int('count').notNull().default(0), windowStart:timestamp('window_start').notNull(), updatedAt:timestamp('updated_at').notNull().defaultNow().onUpdateNow()
});

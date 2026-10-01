CREATE TABLE `aurum_audit_logs` (
	`id` varchar(36) NOT NULL,
	`actor_id` varchar(36),
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(80) NOT NULL,
	`entity_id` varchar(100),
	`metadata` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aurum_audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_content_pages` (
	`id` varchar(36) NOT NULL,
	`route_key` varchar(100) NOT NULL,
	`locale` enum('ru','en') NOT NULL,
	`title` varchar(180) NOT NULL,
	`sections` json NOT NULL,
	`published` boolean NOT NULL DEFAULT true,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aurum_content_pages_id` PRIMARY KEY(`id`),
	CONSTRAINT `content_route_locale_uq` UNIQUE(`route_key`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `aurum_extras` (
	`id` varchar(36) NOT NULL,
	`code` varchar(60) NOT NULL,
	`label_ru` varchar(120) NOT NULL,
	`label_en` varchar(120) NOT NULL,
	`pricing_mode` enum('fixed','hourly') NOT NULL DEFAULT 'fixed',
	`value` int NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	CONSTRAINT `aurum_extras_id` PRIMARY KEY(`id`),
	CONSTRAINT `extras_code_uq` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `aurum_faqs` (
	`id` varchar(36) NOT NULL,
	`question_ru` varchar(300) NOT NULL,
	`question_en` varchar(300) NOT NULL,
	`answer_ru` text NOT NULL,
	`answer_en` text NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `aurum_faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_login_events` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36),
	`email_hash` varchar(64) NOT NULL,
	`ip_hash` varchar(64),
	`user_agent` varchar(500),
	`success` boolean NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aurum_login_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_outbox_events` (
	`id` varchar(36) NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`aggregate_id` varchar(100) NOT NULL,
	`payload` json NOT NULL,
	`delivery_status` enum('pending','processing','delivered','failed') NOT NULL DEFAULT 'pending',
	`attempts` int NOT NULL DEFAULT 0,
	`available_at` timestamp NOT NULL DEFAULT (now()),
	`processed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aurum_outbox_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_pricing_rules` (
	`id` varchar(36) NOT NULL,
	`name` varchar(120) NOT NULL,
	`vehicle_class` varchar(40),
	`service_type` varchar(40),
	`hourly_rate` int,
	`minimum_hours` int,
	`multiplier` decimal(6,3) NOT NULL DEFAULT '1.000',
	`enabled` boolean NOT NULL DEFAULT true,
	`effective_from` timestamp,
	`effective_to` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aurum_pricing_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_rate_limits` (
	`key` varchar(191) NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`window_start` timestamp NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aurum_rate_limits_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `aurum_request_comments` (
	`id` varchar(36) NOT NULL,
	`request_id` varchar(36) NOT NULL,
	`author_id` varchar(36) NOT NULL,
	`body` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aurum_request_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_request_history` (
	`id` varchar(36) NOT NULL,
	`request_id` varchar(36) NOT NULL,
	`actor_id` varchar(36),
	`action` varchar(80) NOT NULL,
	`previous_value` json,
	`new_value` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aurum_request_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_requests` (
	`id` varchar(36) NOT NULL,
	`public_id` varchar(24) NOT NULL,
	`name` varchar(80) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`service_type` varchar(40) NOT NULL,
	`scheduled_at` timestamp NOT NULL,
	`duration_hours` int NOT NULL,
	`passengers` int NOT NULL,
	`luggage` int,
	`vehicle_id` varchar(36),
	`comment` text,
	`status` enum('new','in_progress','awaiting_details','confirmed','completed','cancelled','archived') NOT NULL DEFAULT 'new',
	`locale` enum('ru','en') NOT NULL DEFAULT 'ru',
	`source` varchar(60) NOT NULL DEFAULT 'website',
	`consent_version` varchar(30) NOT NULL,
	`consent_at` timestamp NOT NULL,
	`calculation_snapshot` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aurum_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `requests_public_id_uq` UNIQUE(`public_id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_seo_entries` (
	`id` varchar(36) NOT NULL,
	`route_key` varchar(100) NOT NULL,
	`locale` enum('ru','en') NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` varchar(320) NOT NULL,
	`keywords` varchar(300),
	CONSTRAINT `aurum_seo_entries_id` PRIMARY KEY(`id`),
	CONSTRAINT `seo_route_locale_uq` UNIQUE(`route_key`,`locale`)
);
--> statement-breakpoint
CREATE TABLE `aurum_sessions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`revoked_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aurum_sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_uq` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `aurum_site_settings` (
	`key` varchar(100) NOT NULL,
	`value` json NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aurum_site_settings_key` PRIMARY KEY(`key`)
);
--> statement-breakpoint
CREATE TABLE `aurum_users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(191) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('superadmin','manager') NOT NULL DEFAULT 'manager',
	`active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`last_login_at` timestamp,
	CONSTRAINT `aurum_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_uq` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `aurum_vehicle_images` (
	`id` varchar(36) NOT NULL,
	`vehicle_id` varchar(36) NOT NULL,
	`url` varchar(1000) NOT NULL,
	`alt_ru` varchar(255) NOT NULL,
	`alt_en` varchar(255) NOT NULL,
	`width` int NOT NULL DEFAULT 1600,
	`height` int NOT NULL DEFAULT 1067,
	`sort_order` int NOT NULL DEFAULT 0,
	`cover` boolean NOT NULL DEFAULT false,
	CONSTRAINT `aurum_vehicle_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `aurum_vehicles` (
	`id` varchar(36) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`brand` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`year` int NOT NULL,
	`vehicle_class` enum('business','executive','minivan','suv','event','minibus','coach') NOT NULL,
	`passengers` int NOT NULL,
	`luggage` int NOT NULL DEFAULT 0,
	`title_ru` varchar(180) NOT NULL,
	`title_en` varchar(180) NOT NULL,
	`description_ru` text NOT NULL,
	`description_en` text NOT NULL,
	`hourly_rate` int NOT NULL,
	`min_hours` int NOT NULL,
	`available` boolean NOT NULL DEFAULT true,
	`published` boolean NOT NULL DEFAULT false,
	`equipment` json NOT NULL,
	`driver_features` json NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `aurum_vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `aurum_audit_logs` ADD CONSTRAINT `aurum_audit_logs_actor_id_aurum_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `aurum_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aurum_login_events` ADD CONSTRAINT `aurum_login_events_user_id_aurum_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `aurum_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aurum_request_comments` ADD CONSTRAINT `aurum_request_comments_request_id_aurum_requests_id_fk` FOREIGN KEY (`request_id`) REFERENCES `aurum_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aurum_request_comments` ADD CONSTRAINT `aurum_request_comments_author_id_aurum_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `aurum_users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aurum_request_history` ADD CONSTRAINT `aurum_request_history_request_id_aurum_requests_id_fk` FOREIGN KEY (`request_id`) REFERENCES `aurum_requests`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aurum_request_history` ADD CONSTRAINT `aurum_request_history_actor_id_aurum_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `aurum_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aurum_requests` ADD CONSTRAINT `aurum_requests_vehicle_id_aurum_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `aurum_vehicles`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aurum_sessions` ADD CONSTRAINT `aurum_sessions_user_id_aurum_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `aurum_users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aurum_vehicle_images` ADD CONSTRAINT `aurum_vehicle_images_vehicle_id_aurum_vehicles_id_fk` FOREIGN KEY (`vehicle_id`) REFERENCES `aurum_vehicles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `aurum_audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `audit_entity_idx` ON `aurum_audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `login_events_created_idx` ON `aurum_login_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `outbox_status_available_idx` ON `aurum_outbox_events` (`delivery_status`,`available_at`);--> statement-breakpoint
CREATE INDEX `pricing_scope_idx` ON `aurum_pricing_rules` (`vehicle_class`,`service_type`,`enabled`);--> statement-breakpoint
CREATE INDEX `request_comments_request_idx` ON `aurum_request_comments` (`request_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `request_history_request_idx` ON `aurum_request_history` (`request_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `requests_status_created_idx` ON `aurum_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `requests_phone_idx` ON `aurum_requests` (`phone`);--> statement-breakpoint
CREATE INDEX `sessions_user_exp_idx` ON `aurum_sessions` (`user_id`,`expires_at`);--> statement-breakpoint
CREATE INDEX `users_role_active_idx` ON `aurum_users` (`role`,`active`);--> statement-breakpoint
CREATE INDEX `vehicle_images_vehicle_idx` ON `aurum_vehicle_images` (`vehicle_id`,`sort_order`);--> statement-breakpoint
CREATE INDEX `vehicles_publish_sort_idx` ON `aurum_vehicles` (`published`,`sort_order`);--> statement-breakpoint
CREATE INDEX `vehicles_class_idx` ON `aurum_vehicles` (`vehicle_class`);
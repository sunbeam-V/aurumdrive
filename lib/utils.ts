import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {randomBytes, randomUUID} from 'node:crypto';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatRub(value: number, locale: 'ru'|'en'='ru') { return new Intl.NumberFormat(locale==='ru'?'ru-RU':'en-GB',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(value); }
export function createId() { return randomUUID(); }
export function createPublicId() { return `AD-${randomBytes(4).toString('hex').toUpperCase()}`; }
export function safeJson(value: unknown) { return JSON.parse(JSON.stringify(value)) as unknown; }

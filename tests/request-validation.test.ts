import {describe,expect,it,vi} from 'vitest';
import {normalizePhone,requestSchema} from '@/features/requests/schema';

const valid={name:'Анна',phone:'+7 900 000-00-00',serviceType:'hourly' as const,date:'2030-10-10',time:'12:00',durationHours:3,passengers:2,vehicleSlug:'',extras:[],locale:'ru' as const,consent:true,website:''};

describe('requestSchema',()=>{
  it('accepts optional luggage, vehicle and comment',()=>{vi.setSystemTime(new Date('2026-01-01'));expect(requestSchema.safeParse(valid).success).toBe(true);vi.useRealTimers()});
  it('rejects invalid phone and missing consent',()=>{expect(requestSchema.safeParse({...valid,phone:'12',consent:false}).success).toBe(false)});
  it('rejects past journeys',()=>{expect(requestSchema.safeParse({...valid,date:'2020-01-01'}).success).toBe(false)});
  it('normalizes Russian trunk prefix',()=>{expect(normalizePhone('8 (900) 000-00-00')).toBe('+79000000000')});
});

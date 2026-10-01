import {z} from 'zod';

const phoneRegex = /^\+?[0-9\s()-]{10,22}$/;

export const requestSchema = z.object({
  name: z.string().trim().min(2, 'Укажите имя').max(80),
  phone: z.string().trim().regex(phoneRegex, 'Проверьте номер телефона'),
  serviceType: z.enum(['hourly','transfer','corporate','event']),
  date: z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Выберите дату'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Выберите время'),
  durationHours: z.number().int().min(2).max(72),
  passengers: z.number().int().min(1).max(60),
  vehicleSlug: z.string().max(100).optional().or(z.literal('')),
  luggage: z.number().int().min(0).max(60).optional(),
  comment: z.string().trim().max(1000).optional(),
  extras: z.array(z.enum(['child-seat','meet-sign','extra-stop'])),
  locale: z.enum(['ru','en']),
  consent: z.boolean().refine(Boolean, 'Consent is required'),
  website: z.string().max(0, 'Spam detected').optional()
}).superRefine((value, ctx) => {
  const scheduled = new Date(`${value.date}T${value.time}:00`);
  if (scheduled.getTime() < Date.now() + 30 * 60 * 1000) {
    ctx.addIssue({code:'custom', path:['date'], message:'Выберите время не ранее чем через 30 минут'});
  }
});

export const quoteSchema = requestSchema.pick({serviceType:true,durationHours:true,vehicleSlug:true,extras:true,locale:true});
export type RequestInput = z.infer<typeof requestSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits.startsWith('8') && digits.length === 11 ? `+7${digits.slice(1)}` : `+${digits}`;
}

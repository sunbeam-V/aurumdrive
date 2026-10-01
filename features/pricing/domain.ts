export type PricingInput = {
  hourlyRate: number;
  minimumHours: number;
  durationHours: number;
  serviceMultiplier?: number;
  dateMultiplier?: number;
  extras?: number[];
};

export type PricingSnapshot = PricingInput & {
  billableHours: number;
  extrasTotal: number;
  total: number;
  currency: 'RUB';
  disclaimer: string;
};

export function calculateQuote(input: PricingInput): PricingSnapshot {
  const safeRate = Math.max(0, input.hourlyRate);
  const billableHours = Math.max(input.minimumHours, input.durationHours);
  const serviceMultiplier = input.serviceMultiplier ?? 1;
  const dateMultiplier = input.dateMultiplier ?? 1;
  const extrasTotal = (input.extras ?? []).reduce((sum, value) => sum + Math.max(0, value), 0);
  const total = Math.round((billableHours * safeRate * serviceMultiplier * dateMultiplier + extrasTotal) / 100) * 100;
  return {...input, billableHours, serviceMultiplier, dateMultiplier, extrasTotal, total, currency:'RUB', disclaimer:'Ориентировочная стоимость. Финальную цену подтверждает менеджер.'};
}

export const serviceMultipliers: Record<string, number> = {
  hourly: 1,
  transfer: 1.05,
  corporate: 1,
  event: 1.2
};

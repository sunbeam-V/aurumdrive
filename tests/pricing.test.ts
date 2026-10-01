import {describe,expect,it} from 'vitest';
import {calculateQuote} from '@/features/pricing/domain';

describe('calculateQuote',()=>{
  it('uses minimum hours and all multipliers',()=>{
    const result=calculateQuote({hourlyRate:5000,minimumHours:3,durationHours:2,serviceMultiplier:1.2,dateMultiplier:1.1,extras:[1000,1500]});
    expect(result.billableHours).toBe(3);
    expect(result.extrasTotal).toBe(2500);
    expect(result.total).toBe(22300);
    expect(result.currency).toBe('RUB');
  });
  it('does not mutate a historic snapshot',()=>{
    const input={hourlyRate:7000,minimumHours:3,durationHours:5,extras:[]};
    const snapshot=calculateQuote(input);
    input.hourlyRate=9000;
    expect(snapshot.total).toBe(35000);
  });
});

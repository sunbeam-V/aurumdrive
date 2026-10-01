export type AnalyticsEvent='form_start'|'quote_calculated'|'request_submitted'|'phone_click'|'messenger_click'|'corporate_lead';
export function track(event:AnalyticsEvent,params:Record<string,string|number|boolean>={}){
  if(typeof window==='undefined'||localStorage.getItem('aurum-consent')!=='analytics')return;
  const w=window as typeof window&{dataLayer?:unknown[];ym?:(id:number,method:string,event:string,params:unknown)=>void};
  w.dataLayer?.push({event,...params});
  const id=Number(process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID); if(id&&w.ym)w.ym(id,'reachGoal',event,params);
}

import type {Metadata} from 'next';

export function alternates(path: string, locale: 'ru'|'en'): Metadata['alternates']|undefined {
  const origin=process.env.NEXT_PUBLIC_SITE_URL;
  if(!origin)return undefined;
  const clean=path.startsWith('/')?path:`/${path}`;
  return {canonical:`${origin}/${locale}${clean}`,languages:{ru:`${origin}/ru${clean}`,en:`${origin}/en${clean}`,'x-default':`${origin}/ru${clean}`}};
}

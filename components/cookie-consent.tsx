'use client';

import {useSyncExternalStore} from 'react';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('aurum-consent', onStoreChange);
  return () => { window.removeEventListener('storage', onStoreChange); window.removeEventListener('aurum-consent', onStoreChange); };
}
function getSnapshot() {
  try { return !window.localStorage.getItem('aurum-consent'); } catch { return true; }
}
function getServerSnapshot() { return false; }

export function CookieConsent({locale}: {locale: 'ru' | 'en'}) {
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!visible) return null;
  const decide = (value: 'essential' | 'analytics') => {
    try { window.localStorage.setItem('aurum-consent', value); } catch {}
    window.dispatchEvent(new CustomEvent('aurum-consent', {detail: value}));
  };
  return <aside role="dialog" aria-label={locale === 'ru' ? 'Настройки cookie' : 'Cookie settings'} className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl rounded-card border border-white/15 bg-graphite p-5 shadow-2xl"><p className="text-sm leading-6 text-mist">{locale === 'ru' ? 'Мы используем обязательные cookie для работы сайта. Аналитика включится только с вашего согласия.' : 'We use essential cookies to run the site. Analytics is enabled only with your consent.'}</p><div className="mt-4 flex flex-wrap gap-3"><button onClick={() => decide('analytics')} className="min-h-11 rounded-full bg-aurum px-5 text-sm font-semibold text-obsidian">{locale === 'ru' ? 'Разрешить аналитику' : 'Allow analytics'}</button><button onClick={() => decide('essential')} className="min-h-11 rounded-full border border-white/20 px-5 text-sm">{locale === 'ru' ? 'Только обязательные' : 'Essential only'}</button></div></aside>;
}

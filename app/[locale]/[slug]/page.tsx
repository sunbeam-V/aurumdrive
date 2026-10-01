import type {Metadata} from 'next';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {ArrowRight, CheckCircle2, MessageCircle, Phone} from 'lucide-react';
import {Link} from '@/i18n/routing';
import {OrderForm} from '@/components/forms/order-form';
import {Reveal} from '@/components/motion/reveal';
import {corporateImage, serviceCards} from '@/lib/site-data';
import {alternates} from '@/lib/seo';
import {getPublicFaqs,getPublishedPage,getPublicSettings} from '@/server/repositories/cms';

const allowed = ['services', 'transfers', 'corporate', 'about', 'faq', 'contacts', 'order', 'privacy', 'consent', 'booking-terms'] as const;
type Slug = (typeof allowed)[number];

type Copy = {eyebrow: string; title: string; body: string; items: [string, string][]};

const metadataBySlug: Record<Slug, {ru: [string, string]; en: [string, string]}> = {
  services: {ru: ['Услуги аренды авто с водителем', 'Почасовая аренда, личные поездки, события и сопровождение делегаций в Санкт-Петербурге.'], en: ['Chauffeur services', 'Hourly hire, private journeys, events and delegation support in Saint Petersburg.']},
  transfers: {ru: ['Трансферы по Санкт-Петербургу и области', 'Персональные трансферы в аэропорт, на вокзал и между городами.'], en: ['Saint Petersburg transfers', 'Private airport, railway and intercity chauffeur transfers.']},
  corporate: {ru: ['Корпоративные поездки с водителем', 'Единый стандарт, персональный менеджер и прозрачная отчётность для бизнеса.'], en: ['Corporate chauffeur service', 'Consistent standards, a dedicated manager and transparent reporting.']},
  about: {ru: ['О сервисе Aurum Drive', 'Наш подход к безопасности, пунктуальности и конфиденциальности поездок.'], en: ['About Aurum Drive', 'Our approach to safety, punctuality and confidentiality.']},
  faq: {ru: ['Ответы на вопросы', 'Стоимость, бронирование, изменения и корпоративное обслуживание.'], en: ['Frequently asked questions', 'Pricing, booking, changes and corporate service.']},
  contacts: {ru: ['Контакты', 'Связаться с консьерж-службой Aurum Drive.'], en: ['Contacts', 'Contact the Aurum Drive concierge team.']},
  order: {ru: ['Рассчитать поездку', 'Оставьте заявку и получите ориентировочную стоимость аренды автомобиля с водителем.'], en: ['Plan your journey', 'Request an estimate for a chauffeur-driven car in Saint Petersburg.']},
  privacy: {ru: ['Политика конфиденциальности', 'Шаблон политики конфиденциальности сервиса Aurum Drive.'], en: ['Privacy policy', 'Aurum Drive privacy policy template.']},
  consent: {ru: ['Согласие на обработку данных', 'Шаблон согласия на обработку персональных данных.'], en: ['Data processing consent', 'Personal data processing consent template.']},
  'booking-terms': {ru: ['Условия бронирования', 'Шаблон условий бронирования автомобилей с водителем.'], en: ['Booking terms', 'Chauffeur service booking terms template.']}
};

const legalCopy = {
  privacy: {
    ru: ['Политика конфиденциальности', 'Оператор обрабатывает имя, телефон, сведения о поездке и технические данные, необходимые для исполнения заявки. Данные используются для связи, расчёта, бронирования, безопасности и выполнения требований закона. Передача третьим лицам допускается только исполнителям поездки и поставщикам инфраструктуры в необходимом объёме. Пользователь вправе запросить уточнение, ограничение или прекращение обработки по контактам оператора. Сроки хранения должны быть установлены после утверждения реквизитов и внутренних регламентов.'],
    en: ['Privacy policy', 'The operator processes name, telephone number, journey details and technical data required to fulfil a request. Data is used for communication, quotations, booking, safety and legal compliance. It may be shared only with service providers to the extent required. The user may request correction, restriction or cessation of processing. Retention periods must be confirmed once the operator details and internal policies are approved.']
  },
  consent: {
    ru: ['Согласие на обработку персональных данных', 'Отправляя форму, пользователь свободно и осознанно соглашается на обработку указанных данных для расчёта и организации поездки, связи и ведения истории обращения. Согласие действует до достижения цели или отзыва и может быть отозвано обращением к оператору. Отзыв не влияет на законность обработки, выполненной ранее.'],
    en: ['Personal data consent', 'By submitting the form, the user freely consents to processing the provided data for quotation, journey organisation, communication and request history. Consent remains effective until its purpose is fulfilled or it is withdrawn by contacting the operator. Withdrawal does not affect prior lawful processing.']
  },
  'booking-terms': {
    ru: ['Условия бронирования', 'Бронирование считается подтверждённым только после согласования автомобиля, времени, тарифа и получения подтверждения менеджера. Указанная на сайте стоимость является ориентировочной. Изменения и отмена зависят от времени до подачи и типа услуги. Ожидание, дополнительные остановки, парковки, платные дороги и выезд за согласованную зону могут оплачиваться отдельно после предварительного согласования.'],
    en: ['Booking terms', 'A booking is confirmed only after the vehicle, time and rate are agreed and a manager issues confirmation. Website prices are estimates. Amendment and cancellation conditions depend on lead time and service type. Waiting time, additional stops, parking, tolls and travel outside the agreed area may be charged separately after prior agreement.']
  }
} as const;

export function generateStaticParams() {
  return ['ru', 'en'].flatMap((locale) => allowed.map((slug) => ({locale, slug})));
}

export async function generateMetadata({params}: {params: Promise<{locale: 'ru' | 'en'; slug: string}>}): Promise<Metadata> {
  const {locale, slug} = await params;
  if (!allowed.includes(slug as Slug)) return {};
  const [title, description] = metadataBySlug[slug as Slug][locale];
  return {title, description, alternates: alternates(`/${slug}`, locale)};
}

function standardCopy(key: 'services' | 'transfers' | 'corporate' | 'about', locale: 'ru' | 'en'): Copy {
  const ru = locale === 'ru';
  const data: Record<typeof key, Copy> = {
    services: {eyebrow: ru ? 'В вашем распоряжении' : 'At your disposal', title: ru ? 'Сервис для каждого сценария' : 'A service for every occasion', body: ru ? 'От короткой деловой поездки до многодневного сопровождения — мы проектируем маршрут вокруг вашего графика.' : 'From a short business trip to multi-day support, the journey is designed around your schedule.', items: serviceCards.map((service) => [service.title[locale], service.text[locale]])},
    transfers: {eyebrow: ru ? 'Точно ко времени' : 'Perfectly timed', title: ru ? 'Трансфер без ожидания и спешки' : 'Transfers without waiting or rushing', body: ru ? 'Аэропорт, вокзал или межгород. Менеджер согласует детали, водитель прибудет заранее и поможет с багажом.' : 'Airport, station or intercity. Your manager coordinates the details and your chauffeur arrives early to assist with luggage.', items: [[ru ? 'Пулково' : 'Pulkovo airport', ru ? 'Встреча с табличкой и контроль времени прилёта.' : 'Meet & greet and arrival monitoring.'], [ru ? 'Вокзалы' : 'Railway stations', ru ? 'Подача к нужному выходу и помощь с багажом.' : 'Pickup at the right exit and luggage assistance.'], [ru ? 'Межгород' : 'Intercity', ru ? 'Комфортный автомобиль на всём маршруте.' : 'One comfortable vehicle throughout the journey.']]},
    corporate: {eyebrow: 'Aurum Business', title: ru ? 'Транспорт, который поддерживает ваш стандарт' : 'Transport that reflects your standards', body: ru ? 'Персональный менеджер, единые требования к подаче, безналичная оплата и отчётность по поездкам.' : 'A dedicated manager, consistent presentation, cashless billing and journey reporting.', items: [[ru ? 'Единое окно' : 'One point of contact', ru ? 'Все заявки и изменения координирует персональный менеджер.' : 'A dedicated manager coordinates every request and change.'], [ru ? 'Документы' : 'Reporting', ru ? 'Договор, реестры поездок и закрывающие документы.' : 'Contract, journey registers and closing documents.'], [ru ? 'Масштаб' : 'At scale', ru ? 'От одного руководителя до делегации и форума.' : 'From one executive to a delegation or forum.']]},
    about: {eyebrow: ru ? 'О сервисе' : 'About us', title: ru ? 'Пунктуальность — это форма уважения' : 'Punctuality is a form of respect', body: ru ? 'Мы строим сервис вокруг трёх принципов: точная коммуникация, подготовленный автомобиль и спокойная поездка.' : 'We build every journey around precise communication, a prepared vehicle and calm travel.', items: [[ru ? 'До поездки' : 'Before', ru ? 'Уточняем сценарий, проверяем автомобиль и маршрут.' : 'We confirm the brief, vehicle and route.'], [ru ? 'Во время' : 'During', ru ? 'Водитель сохраняет конфиденциальность и ваш темп.' : 'Your chauffeur protects your privacy and pace.'], [ru ? 'После' : 'After', ru ? 'Фиксируем обратную связь и улучшаем стандарт.' : 'We record feedback and improve the standard.']]}
  };
  return data[key];
}

export default async function ContentPage({params, searchParams}: {params: Promise<{locale: 'ru' | 'en'; slug: string}>; searchParams: Promise<{vehicle?: string}>}) {
  const {locale, slug} = await params;
  if (!allowed.includes(slug as Slug)) notFound();
  const ru = locale === 'ru';
  const key = slug as Slug;

  if (key === 'order') {
    return <section className="pt-[calc(var(--header-h)+64px)] pb-24"><div className="container-shell grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><p className="eyebrow">{ru ? 'Расчёт и заявка' : 'Quote & request'}</p><h1 className="display-title mt-4 text-5xl sm:text-7xl">{ru ? 'Расскажите о поездке' : 'Tell us about your journey'}</h1><p className="mt-6 leading-7 text-mist">{ru ? 'Не нужен точный маршрут: выберите дату, продолжительность и количество пассажиров. Автомобиль можно доверить менеджеру.' : 'No fixed route is required: choose the date, duration and passenger count. Your manager can select the vehicle.'}</p></div><OrderForm locale={locale} initialVehicle={(await searchParams).vehicle}/></div></section>;
  }

  if (key === 'privacy' || key === 'consent' || key === 'booking-terms') {
    const [title, body] = legalCopy[key][locale];
    return <section className="pt-[calc(var(--header-h)+64px)] pb-24"><article className="container-shell max-w-3xl"><p className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning">{ru ? 'Юридический шаблон: перед публикацией замените реквизиты и проверьте текст у профильного юриста.' : 'Legal template: replace operator details and obtain professional legal review before publication.'}</p><h1 className="display-title mt-10 text-5xl sm:text-7xl">{title}</h1><p className="mt-8 text-lg leading-9 text-mist">{body}</p><p className="mt-8 text-sm text-mist">{ru ? 'Версия: 30.09.2026 · Оператор: [указать юридическое лицо] · Контакт: [указать адрес]' : 'Version: 30 September 2026 · Operator: [legal entity] · Contact: [address]'}</p></article></section>;
  }

  if (key === 'faq') {
    const items=await getPublicFaqs();const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:items.map((item)=>({"@type":"Question",name:item.q[locale],acceptedAnswer:{"@type":"Answer",text:item.a[locale]}}))};
    return <section className="pt-[calc(var(--header-h)+64px)] pb-24"><div className="container-shell max-w-4xl"><p className="eyebrow">FAQ</p><h1 className="display-title mt-4 text-5xl sm:text-7xl">{ru ? 'Частые вопросы' : 'Common questions'}</h1><div className="mt-12 divide-y divide-white/10">{items.map((item, index) => <details key={index} className="group py-6"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-display text-2xl"><span>{item.q[locale]}</span><span className="text-aurum transition group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 leading-7 text-mist">{item.a[locale]}</p></details>)}</div></div><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/></section>;
  }

  if (key === 'contacts') {
    const contact=await getPublicSettings();return <section className="pt-[calc(var(--header-h)+64px)] pb-24"><div className="container-shell"><p className="eyebrow">{ru ? 'Консьерж-служба' : 'Concierge'}</p><h1 className="display-title mt-4 text-5xl sm:text-7xl">{ru ? 'Всегда на связи' : 'Always within reach'}</h1><div className="mt-12 grid gap-5 md:grid-cols-3"><a href={contact.phoneHref} data-analytics-event="phone_click" className="glass rounded-card p-7"><Phone className="text-aurum"/><p className="mt-8 text-sm text-mist">{ru ? 'Телефон' : 'Phone'}</p><p className="mt-2 text-xl">{contact.phone}</p></a><a href={contact.telegram} target="_blank" rel="noreferrer" data-analytics-event="messenger_click" className="glass rounded-card p-7"><MessageCircle className="text-aurum"/><p className="mt-8 text-sm text-mist">Telegram</p><p className="mt-2 text-xl">@example</p></a><div className="glass rounded-card p-7"><p className="eyebrow">{ru ? 'Адрес' : 'Address'}</p><p className="mt-8 text-xl">{contact.address[locale]}</p><p className="mt-3 text-sm text-mist">{contact.hours[locale]}</p></div></div><p className="mt-6 text-xs text-warning">{ru ? 'Контакты можно менять в админке.' : 'Contact details are managed in the admin panel.'}</p></div></section>;
  }

  const baseCopy = standardCopy(key as 'services' | 'transfers' | 'corporate' | 'about', locale);
  const cmsPage = await getPublishedPage(key, locale);
  const cmsBody = cmsPage?.sections && typeof cmsPage.sections === 'object' && 'body' in cmsPage.sections && typeof (cmsPage.sections as {body?: unknown}).body === 'string' ? String((cmsPage.sections as {body: string}).body) : '';
  const pageCopy = cmsBody ? {...baseCopy, title:cmsPage?.title || baseCopy.title, body:cmsBody} : baseCopy;
  const serviceSchema={"@context":"https://schema.org","@type":"Service",name:pageCopy.title,description:pageCopy.body,areaServed:['Saint Petersburg','Leningrad Oblast'],provider:{"@type":"LocalBusiness",name:'Aurum Drive'}};
  return <><section className="relative overflow-hidden pt-[calc(var(--header-h)+72px)] pb-20"><div className="container-shell relative z-10"><p className="eyebrow">{pageCopy.eyebrow}</p><h1 className="display-title mt-4 max-w-4xl text-5xl sm:text-7xl">{pageCopy.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-mist">{pageCopy.body}</p></div>{key === 'corporate' && <Image src={corporateImage} alt="" fill className="-z-0 object-cover opacity-20"/>}</section><section className="pb-24"><div className="container-shell grid gap-5 md:grid-cols-3">{pageCopy.items.map(([title, text], index) => <Reveal key={title} delay={index * 0.07}><article className="h-full rounded-card border border-white/10 bg-graphite p-7"><span className="text-sm text-aurum">0{index + 1}</span><h2 className="mt-8 font-display text-3xl">{title}</h2><p className="mt-4 leading-7 text-mist">{text}</p><CheckCircle2 className="mt-8 text-aurum"/></article></Reveal>)}</div><div className="container-shell mt-12"><Link href="/order" data-analytics-event={key==='corporate'?'corporate_lead':undefined} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-aurum px-7 font-semibold text-obsidian">{ru ? 'Обсудить поездку' : 'Discuss your journey'}<ArrowRight size={18}/></Link></div></section><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(serviceSchema)}}/></>;
}

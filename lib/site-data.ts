export type Locale = 'ru' | 'en';
export type VehicleClass = 'business' | 'executive' | 'minivan' | 'suv' | 'event' | 'minibus' | 'coach';

export const site = {
  name: 'Aurum Drive',
  phone: '+7 (812) 000-00-00',
  phoneHref: 'tel:+78120000000',
  email: 'concierge@example.ru',
  telegram: 'https://t.me/example',
  whatsapp: 'https://wa.me/70000000000',
  hours: {ru: 'Круглосуточно, по предварительному заказу', en: '24/7, by prior booking'},
  address: {ru: 'Санкт-Петербург, адрес будет указан позднее', en: 'Saint Petersburg, address to be confirmed'}
} as const;

export const heroImage = '/images/aurum-hero.webp';
export const corporateImage = '/images/range-rover-lwb.webp';

export const vehicles = [
  {id:'veh-001', slug:'mercedes-maybach-s-class', brand:'Mercedes-Maybach', model:'S-Class', year:2025, vehicleClass:'executive' as VehicleClass, passengers:3, luggage:2, hourlyRate:12000, minHours:3, image:'/images/mercedes-maybach-s-class.webp', featured:true,
    title:{ru:'Mercedes-Maybach S-Class',en:'Mercedes-Maybach S-Class'}, description:{ru:'Максимальная тишина салона, персональный климат и представительская подача для встреч высшего уровня.',en:'Exceptional cabin quietness, individual climate control and an executive presence for the most important meetings.'}, equipment:['Wi-Fi','Bottled water','Rear climate','Phone charging']},
  {id:'veh-002', slug:'mercedes-e-class', brand:'Mercedes-Benz', model:'E-Class', year:2025, vehicleClass:'business' as VehicleClass, passengers:3, luggage:2, hourlyRate:5500, minHours:3, image:'/images/mercedes-e-class.webp', featured:true,
    title:{ru:'Mercedes-Benz E-Class',en:'Mercedes-Benz E-Class'}, description:{ru:'Сбалансированный бизнес-седан для встреч, поездок по городу и трансферов.',en:'A refined business sedan for meetings, city journeys and airport transfers.'}, equipment:['Wi-Fi','Bottled water','Phone charging']},
  {id:'veh-003', slug:'range-rover-lwb', brand:'Range Rover', model:'LWB', year:2025, vehicleClass:'suv' as VehicleClass, passengers:4, luggage:4, hourlyRate:9500, minHours:3, image:'/images/range-rover-lwb.webp', featured:true,
    title:{ru:'Range Rover LWB',en:'Range Rover LWB'}, description:{ru:'Просторный SUV для сложных маршрутов, загородных поездок и уверенной деловой подачи.',en:'A spacious SUV for demanding routes, country journeys and a confident executive arrival.'}, equipment:['Wi-Fi','All-wheel drive','Rear climate','Phone charging']},
  {id:'veh-004', slug:'mercedes-v-class', brand:'Mercedes-Benz', model:'V-Class', year:2025, vehicleClass:'minivan' as VehicleClass, passengers:7, luggage:6, hourlyRate:6500, minHours:4, image:'/images/mercedes-v-class.webp', featured:true,
    title:{ru:'Mercedes-Benz V-Class',en:'Mercedes-Benz V-Class'}, description:{ru:'Премиальный минивэн для семей, команд и делегаций до семи пассажиров.',en:'A premium minivan for families, teams and delegations of up to seven passengers.'}, equipment:['Wi-Fi','Bottled water','Rear climate','Child seat on request']},
  {id:'veh-005', slug:'event-signature-sedan', brand:'Aurum Signature', model:'Event Sedan', year:2025, vehicleClass:'event' as VehicleClass, passengers:3, luggage:2, hourlyRate:10000, minHours:5, image:'/images/mercedes-maybach-s-class.webp', featured:false,
    title:{ru:'Signature Event Sedan',en:'Signature Event Sedan'}, description:{ru:'Церемониальная подача для свадеб, закрытых мероприятий и особых вечеров.',en:'Ceremonial presentation for weddings, private events and special evenings.'}, equipment:['Ribbon-free presentation','Bottled water','Umbrella']},
  {id:'veh-006', slug:'executive-minibus', brand:'Aurum Executive', model:'Minibus', year:2025, vehicleClass:'minibus' as VehicleClass, passengers:16, luggage:12, hourlyRate:8500, minHours:5, image:'/images/mercedes-v-class.webp', featured:false,
    title:{ru:'Executive Minibus',en:'Executive Minibus'}, description:{ru:'Комфортное сопровождение делегаций и корпоративных групп до шестнадцати гостей.',en:'Comfortable transport for delegations and corporate groups of up to sixteen guests.'}, equipment:['Wi-Fi','Microphone','Climate control','USB charging']},
  {id:'veh-007', slug:'luxury-coach', brand:'Aurum Grand', model:'Coach', year:2025, vehicleClass:'coach' as VehicleClass, passengers:45, luggage:40, hourlyRate:14000, minHours:6, image:'/images/aurum-hero.webp', featured:false,
    title:{ru:'Luxury Coach',en:'Luxury Coach'}, description:{ru:'Представительский автобус для форумов, конференций и больших групп.',en:'An executive coach for forums, conferences and larger groups.'}, equipment:['Wi-Fi','Microphone','Climate control','Large luggage hold']}
] as const;

export const serviceCards = [
  {key:'hourly', icon:'Clock3', title:{ru:'Почасовая аренда',en:'Hourly chauffeur'}, text:{ru:'Автомобиль остаётся в вашем распоряжении столько, сколько нужно.',en:'A chauffeur-driven car remains at your disposal for as long as required.'}},
  {key:'transfer', icon:'Plane', title:{ru:'Трансферы',en:'Transfers'}, text:{ru:'Встречаем в аэропорту или на вокзале, контролируем время прибытия.',en:'Airport and railway pickup with arrival monitoring and thoughtful timing.'}},
  {key:'corporate', icon:'BriefcaseBusiness', title:{ru:'Корпоративным клиентам',en:'Corporate travel'}, text:{ru:'Единый стандарт поездок для руководителей, команд и делегаций.',en:'A consistent travel standard for executives, teams and delegations.'}},
  {key:'event', icon:'Sparkles', title:{ru:'События',en:'Events'}, text:{ru:'Точная логистика для свадеб, форумов и частных мероприятий.',en:'Precise transport logistics for weddings, forums and private events.'}}
] as const;

export const faqs = [
  {q:{ru:'Как рассчитывается стоимость?',en:'How is the price calculated?'},a:{ru:'Ориентировочная стоимость зависит от класса автомобиля, длительности, типа поездки и дополнительных услуг. Финальную стоимость подтверждает менеджер до бронирования.',en:'The estimate depends on vehicle class, duration, journey type and extras. A manager confirms the final price before booking.'}},
  {q:{ru:'Можно арендовать автомобиль без фиксированного маршрута?',en:'Can I book without a fixed route?'},a:{ru:'Да. Вы выбираете продолжительность, а автомобиль с водителем остаётся в вашем распоряжении в пределах согласованной зоны обслуживания.',en:'Yes. Choose the duration and the chauffeur-driven vehicle stays at your disposal within the agreed service area.'}},
  {q:{ru:'Что если я не знаю, какой автомобиль выбрать?',en:'What if I am not sure which vehicle to choose?'},a:{ru:'Выберите «Подберите автомобиль» и укажите количество пассажиров. Менеджер предложит подходящий класс.',en:'Choose “Select for me” and provide the passenger count. Your manager will suggest the right class.'}},
  {q:{ru:'Можно изменить или отменить заказ?',en:'Can I change or cancel a booking?'},a:{ru:'Да, условия зависят от времени до подачи и типа услуги. Менеджер сообщит применимые условия до подтверждения.',en:'Yes. Terms depend on lead time and service type. Your manager will explain the applicable conditions before confirmation.'}},
  {q:{ru:'Работаете ли вы с юридическими лицами?',en:'Do you work with corporate clients?'},a:{ru:'Да. Предусмотрены договор, безналичная оплата, закрывающие документы и единая точка контакта.',en:'Yes. We support contracts, bank transfer, closing documents and a dedicated point of contact.'}}
] as const;

export const classLabels: Record<VehicleClass, {ru:string;en:string}> = {
  business:{ru:'Бизнес',en:'Business'}, executive:{ru:'Представительский',en:'Executive'}, minivan:{ru:'Минивэн',en:'Minivan'}, suv:{ru:'SUV',en:'SUV'}, event:{ru:'Для событий',en:'Events'}, minibus:{ru:'Микроавтобус',en:'Minibus'}, coach:{ru:'Автобус',en:'Coach'}
};

export const site = {
  name: 'Paw Studio',
  city: 'Москва',
  address: 'Малая Бронная, 24, стр. 1',
  addressNote: 'вход со двора, есть пандус',
  metro: [
    { station: 'Маяковская', walk: '8 минут пешком' },
    { station: 'Пушкинская', walk: '10 минут пешком' },
  ],
  hoursLabel: 'Ежедневно 10:00–21:00',
  phone: '+7 (495) 120-45-67',
  phoneHref: 'tel:+74951204567',
  email: 'hello@pawstudio.ru',
  telegram: 'https://t.me/pawstudio_msk',
  whatsapp: 'https://wa.me/74951204567',
  instagramHandle: '@pawstudio.msk',
  routeUrl:
    'https://yandex.ru/maps/?text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D0%9C%D0%B0%D0%BB%D0%B0%D1%8F%20%D0%91%D1%80%D0%BE%D0%BD%D0%BD%D0%B0%D1%8F%2C%2024',
  foundedYear: 2018,
  legal: {
    entity: 'ИП Соколова Анна Викторовна',
    ogrnip: 'ОГРНИП 318774600321654',
    inn: 'ИНН 772084561920',
  },
  rating: {
    value: '5,0',
    source: 'Яндекс Картах',
    reviews: 214,
  },
} as const;

export const navItems = [
  { id: 'uslugi', label: 'Услуги' },
  { id: 'ceny', label: 'Цены' },
  { id: 'komanda', label: 'Команда' },
  { id: 'otzyvy', label: 'Отзывы' },
  { id: 'zhurnal', label: 'Журнал' },
  { id: 'kontakty', label: 'Контакты' },
] as const;

/* ============================================================
   Dp line · МОК-ДАННЫЕ
   Временная замена API поставщиков (30–40 прайсов, TecDoc).
   При подключении реального бэкенда этот файл удаляется,
   а js/api.js переключается на сетевые запросы — сигнатуры
   функций не меняются.
   ============================================================ */

window.DP_DB = {

  shop: {
    name: 'Dp line',
    city: 'Магнитогорск',
    phone: '+7 (3519) 000-00-00',          /* TODO: реальный номер клиента */
    phoneHref: 'tel:+73519000000',
    supplierCount: '30+',
  },

  pickup: {
    title: 'Пункт самовывоза Dp line',
    address: 'Магнитогорск, пр. Карла Маркса, 158/1',   /* TODO: реальный адрес */
    note: 'Вход со стороны проспекта, парковка у входа',
    hours: [
      { d: 'Пн–Пт', h: '9:00–19:00' },
      { d: 'Суббота', h: '10:00–16:00' },
      { d: 'Воскресенье', h: 'выходной' },
    ],
  },

  suppliers: {
    local:    { name: 'Склад Dp line', city: 'Магнитогорск' },
    partkom:  { name: 'ПартКом',       city: 'Челябинск' },
    berg:     { name: 'Берг',          city: 'Екатеринбург' },
    shatem:   { name: 'Шате-М',        city: 'Уфа' },
    avtoevro: { name: 'АвтоЕвро',      city: 'Москва' },
    rossko:   { name: 'Росско',        city: 'Новосибирск' },
  },

  categories: [
    { id: 'brakes',     name: 'Тормозная система',   icon: 'disc' },
    { id: 'filters',    name: 'Фильтры',             icon: 'filter' },
    { id: 'oils',       name: 'Масла и жидкости',    icon: 'drop' },
    { id: 'ignition',   name: 'Свечи и зажигание',   icon: 'spark' },
    { id: 'suspension', name: 'Подвеска и рулевое',  icon: 'spring' },
    { id: 'battery',    name: 'Аккумуляторы',        icon: 'battery' },
    { id: 'belts',      name: 'Ремни и ГРМ',         icon: 'belt' },
    { id: 'lighting',   name: 'Свет и обзор',        icon: 'lamp' },
  ],

  vehicles: [
    { make: 'LADA',       models: ['Granta', 'Vesta', 'Largus', 'Niva Travel'] },
    { make: 'Hyundai',    models: ['Solaris', 'Creta', 'Tucson'] },
    { make: 'Kia',        models: ['Rio', 'Sportage', 'Ceed'] },
    { make: 'Renault',    models: ['Logan', 'Duster', 'Sandero'] },
    { make: 'Volkswagen', models: ['Polo', 'Tiguan', 'Jetta'] },
    { make: 'Skoda',      models: ['Rapid', 'Octavia'] },
    { make: 'Toyota',     models: ['Corolla', 'Camry', 'RAV4'] },
  ],

  /* Подсказки в поисковой строке */
  popularQueries: ['W 914/2', 'колодки Rio', '5W-40', 'BKR6E-11', 'щётки 600'],

  /* ----------------------------------------------------------
     ПОЗИЦИИ. offers: sup — ключ поставщика, days — срок
     поступления на пункт выдачи (0 = уже на складе Dp line),
     daysMax — верхняя граница срока, qty — остаток, price — ₽.
     analogs — id кроссов/аналогов.
     ---------------------------------------------------------- */
  parts: [

    /* ===== Тормозная система ===== */
    {
      id: 'brembo-09977211', article: '09.9772.11', brand: 'Brembo',
      name: 'Диск тормозной передний вентилируемый, 256 мм',
      cat: 'brakes', fits: 'Hyundai Solaris I/II · Kia Rio III/IV', popular: true,
      specs: { 'Диаметр': '256 мм', 'Толщина': '22 мм', 'Высота': '46,4 мм', 'Крепёж': '4 отв.', 'Тип': 'вентилируемый' },
      analogs: ['trw-df4864', 'bosch-0986479s43'],
      offers: [
        { sup: 'berg', days: 1, qty: 6, price: 3480 },
        { sup: 'local', days: 0, qty: 2, price: 3720 },
        { sup: 'shatem', days: 2, qty: 8, price: 3540 },
        { sup: 'rossko', days: 3, daysMax: 4, qty: 14, price: 3390 },
      ],
    },
    {
      id: 'trw-df4864', article: 'DF4864', brand: 'TRW',
      name: 'Диск тормозной передний вентилируемый, 256 мм',
      cat: 'brakes', fits: 'Hyundai Solaris I/II · Kia Rio III/IV',
      specs: { 'Диаметр': '256 мм', 'Толщина': '22 мм', 'Мин. толщина': '20 мм', 'Тип': 'вентилируемый' },
      analogs: ['brembo-09977211', 'bosch-0986479s43'],
      offers: [
        { sup: 'local', days: 0, qty: 4, price: 2890 },
        { sup: 'avtoevro', days: 2, daysMax: 4, qty: 10, price: 2690 },
      ],
    },
    {
      id: 'bosch-0986479s43', article: '0 986 479 S43', brand: 'Bosch',
      name: 'Диск тормозной передний, 256 мм',
      cat: 'brakes', fits: 'Hyundai Solaris I/II · Kia Rio III/IV',
      specs: { 'Диаметр': '256 мм', 'Толщина': '22 мм', 'Тип': 'вентилируемый' },
      analogs: ['brembo-09977211', 'trw-df4864'],
      offers: [{ sup: 'rossko', days: 3, daysMax: 5, qty: 7, price: 3120 }],
    },
    {
      id: 'trw-gdb3331', article: 'GDB3331', brand: 'TRW',
      name: 'Колодки тормозные передние, комплект 4 шт.',
      cat: 'brakes', fits: 'Hyundai Solaris · Kia Rio III/IV · Ceed', popular: true,
      specs: { 'Ширина': '141,9 мм', 'Высота': '59,4 мм', 'Толщина': '17,4 мм', 'Датчик износа': 'акустический' },
      analogs: ['sangsin-sp1399', 'ferodo-fdb4623'],
      offers: [
        { sup: 'local', days: 0, qty: 5, price: 1850 },
        { sup: 'berg', days: 1, qty: 12, price: 1750 },
        { sup: 'rossko', days: 3, qty: 20, price: 1690 },
      ],
    },
    {
      id: 'sangsin-sp1399', article: 'SP1399', brand: 'Sangsin Brake',
      name: 'Колодки тормозные передние, комплект 4 шт.',
      cat: 'brakes', fits: 'Hyundai Solaris · Kia Rio III/IV',
      specs: { 'Ширина': '141,9 мм', 'Высота': '59,4 мм', 'Толщина': '17,4 мм' },
      analogs: ['trw-gdb3331', 'ferodo-fdb4623'],
      offers: [
        { sup: 'partkom', days: 1, qty: 9, price: 1290 },
        { sup: 'shatem', days: 2, qty: 16, price: 1240 },
      ],
    },
    {
      id: 'ferodo-fdb4623', article: 'FDB4623', brand: 'Ferodo',
      name: 'Колодки тормозные передние, комплект 4 шт.',
      cat: 'brakes', fits: 'Hyundai Solaris · Kia Rio III/IV',
      specs: { 'Ширина': '141,9 мм', 'Высота': '59,4 мм', 'Толщина': '17,4 мм' },
      analogs: ['trw-gdb3331', 'sangsin-sp1399'],
      offers: [{ sup: 'avtoevro', days: 2, daysMax: 4, qty: 6, price: 1990 }],
    },
    {
      id: 'ate-2401220217', article: '24.0122-0217.1', brand: 'ATE',
      name: 'Диск тормозной задний, 253 мм',
      cat: 'brakes', fits: 'Skoda Octavia III · Rapid · VW Polo',
      specs: { 'Диаметр': '253 мм', 'Толщина': '10 мм', 'Тип': 'невентилируемый' },
      analogs: [],
      offers: [{ sup: 'berg', days: 1, daysMax: 2, qty: 4, price: 4290 }],
    },

    /* ===== Фильтры ===== */
    {
      id: 'mann-w9142', article: 'W 914/2', brand: 'MANN-FILTER',
      name: 'Фильтр масляный',
      cat: 'filters', fits: 'LADA Granta · Vesta · Largus · Niva Travel', popular: true,
      specs: { 'Высота': '95 мм', 'Резьба': '3/4-16 UNF', 'Наруж. диаметр': '76 мм', 'Обратный клапан': 'да' },
      analogs: ['mahle-oc205', 'bosch-0451103271'],
      offers: [
        { sup: 'local', days: 0, qty: 18, price: 420 },
        { sup: 'berg', days: 1, qty: 40, price: 380 },
        { sup: 'avtoevro', days: 2, daysMax: 3, qty: 60, price: 365 },
        { sup: 'rossko', days: 3, qty: 120, price: 350 },
      ],
    },
    {
      id: 'mahle-oc205', article: 'OC 205', brand: 'MAHLE',
      name: 'Фильтр масляный',
      cat: 'filters', fits: 'LADA Granta · Vesta · Largus',
      specs: { 'Высота': '95 мм', 'Резьба': '3/4-16 UNF', 'Наруж. диаметр': '76 мм' },
      analogs: ['mann-w9142', 'bosch-0451103271'],
      offers: [
        { sup: 'partkom', days: 1, qty: 22, price: 410 },
        { sup: 'shatem', days: 2, qty: 35, price: 390 },
      ],
    },
    {
      id: 'bosch-0451103271', article: '0 451 103 271', brand: 'Bosch',
      name: 'Фильтр масляный',
      cat: 'filters', fits: 'LADA Granta · Vesta · Largus',
      specs: { 'Высота': '95 мм', 'Резьба': '3/4-16 UNF' },
      analogs: ['mann-w9142', 'mahle-oc205'],
      offers: [{ sup: 'rossko', days: 3, daysMax: 4, qty: 48, price: 330 }],
    },
    {
      id: 'mann-c30195', article: 'C 30 195', brand: 'MANN-FILTER',
      name: 'Фильтр воздушный панельный',
      cat: 'filters', fits: 'VW Polo · Skoda Rapid 1.6',
      specs: { 'Длина': '295 мм', 'Ширина': '235 мм', 'Высота': '58 мм' },
      analogs: [],
      offers: [
        { sup: 'berg', days: 1, qty: 11, price: 890 },
        { sup: 'avtoevro', days: 2, daysMax: 3, qty: 25, price: 850 },
      ],
    },
    {
      id: 'filtron-ap1084', article: 'AP 108/4', brand: 'Filtron',
      name: 'Фильтр воздушный панельный',
      cat: 'filters', fits: 'LADA Granta · Kalina · Priora',
      specs: { 'Длина': '260 мм', 'Ширина': '168 мм', 'Высота': '48 мм' },
      analogs: [],
      offers: [
        { sup: 'local', days: 0, qty: 9, price: 340 },
        { sup: 'rossko', days: 3, qty: 70, price: 290 },
      ],
    },
    {
      id: 'mann-cuk2545', article: 'CUK 2545', brand: 'MANN-FILTER',
      name: 'Фильтр салона угольный',
      cat: 'filters', fits: 'Hyundai Solaris · Kia Rio · Creta', popular: true,
      specs: { 'Длина': '240 мм', 'Ширина': '190 мм', 'Тип': 'активированный уголь' },
      analogs: ['filtron-k1313a'],
      offers: [
        { sup: 'berg', days: 1, qty: 14, price: 1190 },
        { sup: 'shatem', days: 2, qty: 20, price: 1090 },
        { sup: 'rossko', days: 3, daysMax: 4, qty: 33, price: 1020 },
      ],
    },
    {
      id: 'filtron-k1313a', article: 'K 1313A', brand: 'Filtron',
      name: 'Фильтр салона угольный',
      cat: 'filters', fits: 'Hyundai Solaris · Kia Rio',
      specs: { 'Длина': '240 мм', 'Ширина': '190 мм', 'Тип': 'активированный уголь' },
      analogs: ['mann-cuk2545'],
      offers: [{ sup: 'partkom', days: 1, qty: 8, price: 590 }],
    },
    {
      id: 'mann-wk512', article: 'WK 512', brand: 'MANN-FILTER',
      name: 'Фильтр топливный',
      cat: 'filters', fits: 'Renault Logan · Sandero · LADA Largus',
      specs: { 'Высота': '140 мм', 'Штуцер': '8 мм', 'Давление': 'до 5 бар' },
      analogs: [],
      offers: [
        { sup: 'berg', days: 1, daysMax: 2, qty: 6, price: 1050 },
        { sup: 'avtoevro', days: 2, daysMax: 4, qty: 15, price: 980 },
      ],
    },
    {
      id: 'big-gb9597', article: 'GB-9597', brand: 'BIG Filter',
      name: 'Фильтр салона',
      cat: 'filters', fits: 'LADA Vesta · XRAY',
      specs: { 'Длина': '255 мм', 'Ширина': '182 мм' },
      analogs: [],
      offers: [{ sup: 'local', days: 0, qty: 12, price: 450 }],
    },

    /* ===== Масла и жидкости ===== */
    {
      id: 'castrol-magnatec5w40', article: '156E9F', brand: 'Castrol',
      name: 'Масло моторное Magnatec 5W-40 A3/B4, синтетика, 4 л',
      cat: 'oils', fits: 'Универсально', universal: true, popular: true,
      specs: { 'Вязкость': '5W-40', 'Допуски': 'API SN/CF, A3/B4', 'Объём': '4 л', 'Тип': 'синтетика' },
      analogs: ['shell-hx85w30', 'liquimoly-molygen5w40', 'lukoil-genesis5w40'],
      offers: [
        { sup: 'local', days: 0, qty: 7, price: 3290 },
        { sup: 'berg', days: 1, qty: 20, price: 3140 },
        { sup: 'avtoevro', days: 2, daysMax: 3, qty: 44, price: 2990 },
      ],
    },
    {
      id: 'shell-hx85w30', article: '550046777', brand: 'Shell',
      name: 'Масло моторное Helix HX8 Synthetic 5W-30, 4 л',
      cat: 'oils', fits: 'Универсально', universal: true,
      specs: { 'Вязкость': '5W-30', 'Допуски': 'API SN+, A3/B4', 'Объём': '4 л', 'Тип': 'синтетика' },
      analogs: ['castrol-magnatec5w40', 'lukoil-genesis5w40'],
      offers: [
        { sup: 'partkom', days: 1, qty: 16, price: 2890 },
        { sup: 'rossko', days: 3, daysMax: 4, qty: 52, price: 2740 },
      ],
    },
    {
      id: 'liquimoly-molygen5w40', article: '9054', brand: 'LIQUI MOLY',
      name: 'Масло моторное Molygen New Generation 5W-40, 4 л',
      cat: 'oils', fits: 'Универсально', universal: true,
      specs: { 'Вязкость': '5W-40', 'Допуски': 'API SN/CF', 'Объём': '4 л', 'Особенность': 'молибденовая присадка' },
      analogs: ['castrol-magnatec5w40'],
      offers: [
        { sup: 'berg', days: 1, qty: 9, price: 4590 },
        { sup: 'shatem', days: 2, qty: 14, price: 4390 },
      ],
    },
    {
      id: 'lukoil-genesis5w40', article: '3148675', brand: 'ЛУКОЙЛ',
      name: 'Масло моторное Genesis Armortech 5W-40, 4 л',
      cat: 'oils', fits: 'Универсально', universal: true, popular: true,
      specs: { 'Вязкость': '5W-40', 'Допуски': 'API SN/CF, A3/B4', 'Объём': '4 л', 'Тип': 'синтетика' },
      analogs: ['castrol-magnatec5w40', 'shell-hx85w30'],
      offers: [
        { sup: 'local', days: 0, qty: 11, price: 2190 },
        { sup: 'rossko', days: 3, qty: 80, price: 1990 },
      ],
    },
    {
      id: 'zic-atfmulti', article: '162628', brand: 'ZIC',
      name: 'Масло трансмиссионное ATF Multi, 4 л',
      cat: 'oils', fits: 'Универсально (АКПП)', universal: true,
      specs: { 'Тип': 'ATF универсальное', 'Объём': '4 л' },
      analogs: [],
      offers: [
        { sup: 'berg', days: 1, qty: 6, price: 2990 },
        { sup: 'avtoevro', days: 2, daysMax: 4, qty: 18, price: 2850 },
      ],
    },
    {
      id: 'sintec-g12unl', article: '803270', brand: 'Sintec',
      name: 'Антифриз Unlimited G12++, красный, 5 кг',
      cat: 'oils', fits: 'Универсально', universal: true,
      specs: { 'Стандарт': 'G12++', 'Цвет': 'красный', 'Масса': '5 кг', 'Температура': 'до −45 °C' },
      analogs: [],
      offers: [
        { sup: 'local', days: 0, qty: 14, price: 890 },
        { sup: 'partkom', days: 1, qty: 30, price: 790 },
      ],
    },
    {
      id: 'rosdot-dot4', article: '430101H03', brand: 'РосДОТ',
      name: 'Жидкость тормозная DOT-4, 455 г',
      cat: 'oils', fits: 'Универсально', universal: true,
      specs: { 'Стандарт': 'DOT-4', 'Масса': '455 г', 'Т кипения': '≥ 230 °C' },
      analogs: [],
      offers: [
        { sup: 'local', days: 0, qty: 25, price: 260 },
        { sup: 'rossko', days: 3, qty: 90, price: 210 },
      ],
    },

    /* ===== Свечи и зажигание ===== */
    {
      id: 'ngk-bkr6e11', article: 'BKR6E-11', brand: 'NGK',
      name: 'Свеча зажигания никелевая (2756)',
      cat: 'ignition', fits: 'Hyundai Solaris · Kia Rio · Toyota Corolla', popular: true,
      specs: { 'Резьба': 'M14×1,25', 'Ключ': '16 мм', 'Зазор': '1,1 мм', 'Калильное число': '6' },
      analogs: ['denso-k20txr', 'bosch-fr7dcplus'],
      offers: [
        { sup: 'local', days: 0, qty: 40, price: 320 },
        { sup: 'berg', days: 1, qty: 100, price: 280 },
        { sup: 'shatem', days: 2, qty: 64, price: 260 },
        { sup: 'rossko', days: 3, qty: 200, price: 240 },
      ],
    },
    {
      id: 'denso-k20txr', article: 'K20TXR', brand: 'DENSO',
      name: 'Свеча зажигания никелевая',
      cat: 'ignition', fits: 'Hyundai Solaris · Kia Rio · Toyota Corolla',
      specs: { 'Резьба': 'M14×1,25', 'Ключ': '16 мм', 'Зазор': '1,1 мм' },
      analogs: ['ngk-bkr6e11', 'bosch-fr7dcplus'],
      offers: [
        { sup: 'partkom', days: 1, qty: 36, price: 310 },
        { sup: 'avtoevro', days: 2, daysMax: 3, qty: 88, price: 290 },
      ],
    },
    {
      id: 'bosch-fr7dcplus', article: 'FR7DC+', brand: 'Bosch',
      name: 'Свеча зажигания никелевая',
      cat: 'ignition', fits: 'Hyundai Solaris · Kia Rio · VW Polo',
      specs: { 'Резьба': 'M14×1,25', 'Ключ': '16 мм', 'Зазор': '0,9 мм' },
      analogs: ['ngk-bkr6e11', 'denso-k20txr'],
      offers: [{ sup: 'rossko', days: 3, daysMax: 4, qty: 150, price: 270 }],
    },
    {
      id: 'ngk-ilzkr7b11', article: 'ILZKR7B-11', brand: 'NGK',
      name: 'Свеча зажигания иридиевая',
      cat: 'ignition', fits: 'Hyundai Creta · Kia Sportage · Ceed',
      specs: { 'Резьба': 'M12×1,25', 'Ключ': '14 мм', 'Электрод': 'иридий/платина' },
      analogs: [],
      offers: [
        { sup: 'berg', days: 1, qty: 24, price: 1490 },
        { sup: 'avtoevro', days: 2, daysMax: 4, qty: 60, price: 1390 },
      ],
    },
    {
      id: 'bosch-0221504461', article: '0 221 504 461', brand: 'Bosch',
      name: 'Катушка зажигания',
      cat: 'ignition', fits: 'LADA Granta · Kalina · Priora 16V',
      specs: { 'Тип': 'индивидуальная', 'Выводы': '3' },
      analogs: [],
      offers: [{ sup: 'shatem', days: 2, daysMax: 3, qty: 5, price: 2890 }],
    },

    /* ===== Подвеска и рулевое ===== */
    {
      id: 'kyb-333491', article: '333491', brand: 'KYB',
      name: 'Амортизатор передний правый, газомасляный',
      cat: 'suspension', fits: 'Hyundai Solaris I · Kia Rio III', popular: true,
      specs: { 'Тип': 'газомасляный', 'Сторона': 'правая', 'Серия': 'Excel-G' },
      analogs: ['sachs-314897'],
      offers: [
        { sup: 'berg', days: 1, daysMax: 2, qty: 4, price: 4890 },
        { sup: 'avtoevro', days: 2, daysMax: 4, qty: 9, price: 4690 },
        { sup: 'rossko', days: 3, daysMax: 5, qty: 12, price: 4590 },
      ],
    },
    {
      id: 'kyb-333490', article: '333490', brand: 'KYB',
      name: 'Амортизатор передний левый, газомасляный',
      cat: 'suspension', fits: 'Hyundai Solaris I · Kia Rio III',
      specs: { 'Тип': 'газомасляный', 'Сторона': 'левая', 'Серия': 'Excel-G' },
      analogs: ['sachs-314897'],
      offers: [
        { sup: 'berg', days: 1, daysMax: 2, qty: 3, price: 4890 },
        { sup: 'rossko', days: 3, daysMax: 5, qty: 10, price: 4590 },
      ],
    },
    {
      id: 'sachs-314897', article: '314 897', brand: 'SACHS',
      name: 'Амортизатор передний, газомасляный',
      cat: 'suspension', fits: 'Hyundai Solaris I · Kia Rio III',
      specs: { 'Тип': 'газомасляный', 'Крепление': 'нижнее ухо' },
      analogs: ['kyb-333491', 'kyb-333490'],
      offers: [{ sup: 'shatem', days: 2, daysMax: 3, qty: 6, price: 5490 }],
    },
    {
      id: 'lemforder-3363701', article: '33637 01', brand: 'Lemförder',
      name: 'Опора шаровая нижняя',
      cat: 'suspension', fits: 'VW Polo · Skoda Rapid · Fabia',
      specs: { 'Конус': '15 мм', 'Резьба': 'M10×1,5' },
      analogs: [],
      offers: [
        { sup: 'berg', days: 1, qty: 7, price: 2090 },
        { sup: 'avtoevro', days: 2, daysMax: 4, qty: 15, price: 1890 },
      ],
    },
    {
      id: 'trw-jtc1301', article: 'JTC1301', brand: 'TRW',
      name: 'Рычаг передний нижний левый',
      cat: 'suspension', fits: 'Kia Rio III · Hyundai Solaris I',
      specs: { 'Сторона': 'левая', 'С шаровой опорой': 'да', 'С сайлентблоками': 'да' },
      analogs: [],
      offers: [{ sup: 'rossko', days: 3, daysMax: 5, qty: 5, price: 5290 }],
    },
    {
      id: 'febi-42572', article: '42572', brand: 'febi bilstein',
      name: 'Стойка стабилизатора передняя',
      cat: 'suspension', fits: 'Hyundai Solaris · Kia Rio · Creta', popular: true,
      specs: { 'Длина': '145 мм', 'Резьба': 'M10×1,25' },
      analogs: [],
      offers: [
        { sup: 'local', days: 0, qty: 8, price: 890 },
        { sup: 'partkom', days: 1, qty: 19, price: 790 },
        { sup: 'shatem', days: 2, qty: 26, price: 740 },
      ],
    },
    {
      id: 'skf-vkba6556', article: 'VKBA 6556', brand: 'SKF',
      name: 'Подшипник ступицы передней, комплект',
      cat: 'suspension', fits: 'Renault Duster · Logan II',
      specs: { 'Внутр. диаметр': '37 мм', 'Наруж. диаметр': '72 мм', 'С ABS': 'да' },
      analogs: [],
      offers: [{ sup: 'berg', days: 1, daysMax: 2, qty: 4, price: 3990 }],
    },

    /* ===== Аккумуляторы ===== */
    {
      id: 'bosch-s4005', article: 'S4 005', brand: 'Bosch',
      name: 'Аккумулятор 60 Ач 540 А, обратная полярность',
      cat: 'battery', fits: 'Универсально', universal: true, popular: true,
      specs: { 'Ёмкость': '60 Ач', 'Пусковой ток': '540 А', 'Полярность': 'обратная', 'Размеры': '242×175×190 мм' },
      analogs: ['mutlu-sfbm260', 'varta-blued24', 'tyumen-premium60'],
      offers: [
        { sup: 'local', days: 0, qty: 3, price: 7490 },
        { sup: 'berg', days: 1, qty: 8, price: 6890 },
      ],
    },
    {
      id: 'mutlu-sfbm260', article: 'SFB M2 60', brand: 'Mutlu',
      name: 'Аккумулятор 60 Ач 540 А, обратная полярность',
      cat: 'battery', fits: 'Универсально', universal: true,
      specs: { 'Ёмкость': '60 Ач', 'Пусковой ток': '540 А', 'Полярность': 'обратная' },
      analogs: ['bosch-s4005', 'tyumen-premium60'],
      offers: [
        { sup: 'local', days: 0, qty: 2, price: 6290 },
        { sup: 'shatem', days: 2, qty: 6, price: 5890 },
      ],
    },
    {
      id: 'varta-blued24', article: 'D24 560 408 054', brand: 'VARTA',
      name: 'Аккумулятор Blue Dynamic 60 Ач 540 А',
      cat: 'battery', fits: 'Универсально', universal: true,
      specs: { 'Ёмкость': '60 Ач', 'Пусковой ток': '540 А', 'Полярность': 'обратная' },
      analogs: ['bosch-s4005'],
      offers: [{ sup: 'avtoevro', days: 2, daysMax: 4, qty: 5, price: 7190 }],
    },
    {
      id: 'tyumen-premium60', article: '6СТ-60LA', brand: 'Тюмень',
      name: 'Аккумулятор Premium 60 Ач 540 А',
      cat: 'battery', fits: 'Универсально', universal: true, popular: true,
      specs: { 'Ёмкость': '60 Ач', 'Пусковой ток': '540 А', 'Полярность': 'обратная' },
      analogs: ['bosch-s4005', 'mutlu-sfbm260'],
      offers: [{ sup: 'local', days: 0, qty: 6, price: 5490 }],
    },

    /* ===== Ремни и ГРМ ===== */
    {
      id: 'gates-k015631xs', article: 'K015631XS', brand: 'Gates',
      name: 'Комплект ГРМ: ремень + 2 ролика',
      cat: 'belts', fits: 'Renault Logan · Sandero · LADA Largus (K4M 16V)', popular: true,
      specs: { 'Зубьев': '132', 'Ширина': '27 мм', 'Состав': 'ремень, ролик натяжной, ролик обводной' },
      analogs: ['contitech-ct1035'],
      offers: [
        { sup: 'berg', days: 1, daysMax: 2, qty: 5, price: 6490 },
        { sup: 'avtoevro', days: 2, daysMax: 4, qty: 11, price: 6190 },
        { sup: 'rossko', days: 3, daysMax: 5, qty: 17, price: 5990 },
      ],
    },
    {
      id: 'contitech-ct1035', article: 'CT1035', brand: 'ContiTech',
      name: 'Ремень ГРМ',
      cat: 'belts', fits: 'Renault Logan · Sandero 8V',
      specs: { 'Зубьев': '128', 'Ширина': '24 мм' },
      analogs: ['gates-k015631xs'],
      offers: [{ sup: 'partkom', days: 1, qty: 8, price: 1890 }],
    },
    {
      id: 'gates-6pk1230', article: '6PK1230', brand: 'Gates',
      name: 'Ремень поликлиновой',
      cat: 'belts', fits: 'Hyundai Solaris · Kia Rio 1.6',
      specs: { 'Ручьёв': '6', 'Длина': '1230 мм' },
      analogs: [],
      offers: [
        { sup: 'local', days: 0, qty: 4, price: 1290 },
        { sup: 'shatem', days: 2, qty: 12, price: 1140 },
      ],
    },
    {
      id: 'dayco-apv2732', article: 'APV2732', brand: 'DAYCO',
      name: 'Ролик натяжителя приводного ремня',
      cat: 'belts', fits: 'Renault Duster · Logan 1.6 16V',
      specs: { 'Наруж. диаметр': '55 мм', 'Ширина': '26 мм' },
      analogs: [],
      offers: [{ sup: 'rossko', days: 3, daysMax: 4, qty: 7, price: 2190 }],
    },

    /* ===== Свет и обзор ===== */
    {
      id: 'osram-nb200h4', article: '64193NB200-HCB', brand: 'OSRAM',
      name: 'Лампы галогенные Night Breaker 200 H4, комплект 2 шт.',
      cat: 'lighting', fits: 'Универсально (цоколь H4)', universal: true, popular: true,
      specs: { 'Цоколь': 'H4', 'Мощность': '60/55 Вт', 'Яркость': '+200%', 'Комплект': '2 шт.' },
      analogs: ['philips-h7vision'],
      offers: [
        { sup: 'berg', days: 1, qty: 10, price: 1890 },
        { sup: 'avtoevro', days: 2, daysMax: 3, qty: 26, price: 1790 },
      ],
    },
    {
      id: 'philips-h7vision', article: '12972PRC1', brand: 'Philips',
      name: 'Лампа галогенная Vision H7 +30%',
      cat: 'lighting', fits: 'Универсально (цоколь H7)', universal: true,
      specs: { 'Цоколь': 'H7', 'Мощность': '55 Вт', 'Яркость': '+30%' },
      analogs: [],
      offers: [
        { sup: 'local', days: 0, qty: 16, price: 390 },
        { sup: 'rossko', days: 3, qty: 55, price: 320 },
      ],
    },
    {
      id: 'bosch-ar604s', article: '3 397 118 908', brand: 'Bosch',
      name: 'Щётки стеклоочистителя Aerotwin AR604S, 600/450 мм',
      cat: 'lighting', fits: 'Hyundai Solaris · Kia Rio · VW Polo', popular: true,
      specs: { 'Длина': '600 + 450 мм', 'Тип': 'бескаркасные', 'Крепление': 'крючок' },
      analogs: [],
      offers: [
        { sup: 'local', days: 0, qty: 6, price: 1590 },
        { sup: 'berg', days: 1, qty: 15, price: 1440 },
        { sup: 'shatem', days: 2, qty: 21, price: 1390 },
      ],
    },
  ],
};

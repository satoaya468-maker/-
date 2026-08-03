export interface PriceRow {
  label: string;
  hint?: string;
  price: number;
  from?: boolean;
}

export interface PriceGroup {
  title: string;
  rows: readonly PriceRow[];
}

export const priceGroups: readonly PriceGroup[] = [
  {
    title: 'Комплекс для собак',
    rows: [
      { label: 'До 5 кг', hint: 'той-пудель, йорк, шпиц', price: 2500 },
      { label: '5–15 кг', hint: 'кокер, шелти, французский бульдог', price: 3500 },
      { label: '15–30 кг', hint: 'лабрадор, хаски, самоед', price: 5000 },
      { label: 'От 30 кг', hint: 'овчарка, ньюфаундленд', price: 6500, from: true },
    ],
  },
  {
    title: 'Комплекс для кошек',
    rows: [
      { label: 'Короткошёрстные', hint: 'британская, шотландская', price: 3000 },
      { label: 'Длинношёрстные', hint: 'мейн-кун, сибирская', price: 3800 },
      { label: 'Экспресс-линька', price: 3500, from: true },
    ],
  },
  {
    title: 'Отдельные процедуры',
    rows: [
      { label: 'Стрижка когтей', price: 500 },
      { label: 'Чистка ушей и глаз', price: 400 },
      { label: 'Мытьё и сушка без стрижки', price: 1500, from: true },
      { label: 'Вычёсывание, 30 минут', price: 1000 },
      { label: 'Тримминг жесткошёрстных', price: 4000, from: true },
      { label: 'SPA-программа к комплексу', price: 2000, from: true },
    ],
  },
] as const;

export const pricingNotes: readonly string[] = [
  'Точную стоимость называем после осмотра и до начала работы. В процессе она не меняется.',
  'Сложное состояние шерсти и колтуны оцениваем честно и обсуждаем с вами варианты: расчесать или подстричь короче.',
] as const;

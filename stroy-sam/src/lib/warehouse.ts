/**
 * База на Западном шоссе. Часы работы и текущий статус отгрузки.
 *
 * Считается по времени Магнитогорска (UTC+5) независимо от таймзоны
 * устройства: прораб может быть в командировке, а база — нет.
 */

export const WAREHOUSE = {
  title: 'База на Западном шоссе',
  address: 'Магнитогорск, Западное шоссе, 16/2',
  phone: '+7 (3519) 55-04-04',
  /** Часы приёма заявок на отгрузку, местное время */
  hours: { open: 7, close: 20 },
  /** Диспетчер принимает заявки и ночью — просто отгрузка утром */
  nightDispatch: true,
  timezoneOffset: 5,
} as const;

export interface WarehouseStatus {
  open: boolean;
  /** Короткая строка для шапки */
  label: string;
  /** Уточнение под строкой */
  detail: string;
  localTime: string;
}

function magnitogorskNow(now: Date): { hours: number; minutes: number } {
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const local = (utcMinutes + WAREHOUSE.timezoneOffset * 60 + 1440) % 1440;
  return { hours: Math.floor(local / 60), minutes: local % 60 };
}

export function warehouseStatus(now: Date = new Date()): WarehouseStatus {
  const { hours, minutes } = magnitogorskNow(now);
  const localTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  const open = hours >= WAREHOUSE.hours.open && hours < WAREHOUSE.hours.close;

  if (open) {
    const left = WAREHOUSE.hours.close - hours;
    return {
      open: true,
      label: 'База отгружает',
      detail: left <= 2 ? `Приём заявок ещё ${left} ч` : `До ${WAREHOUSE.hours.close}:00`,
      localTime,
    };
  }

  return {
    open: false,
    label: 'Заявка на утро',
    detail: `Отгрузка с ${WAREHOUSE.hours.open}:00`,
    localTime,
  };
}

/** Зоны доставки от базы. Цена фиксированная, время — расчётное. */
export const DELIVERY_ZONES = [
  { id: 'city', title: 'Магнитогорск', eta: 'от 30 минут', price: 'бесплатно от 5 т', km: 0 },
  { id: 'suburb', title: 'Пригород до 30 км', eta: 'от 1,5 часов', price: '45 ₽/км', km: 30 },
  { id: 'region', title: 'Челябинская область', eta: 'день в день', price: 'по расчёту', km: 120 },
  { id: 'bashkiria', title: 'Башкирия, Абзелиловский р-н', eta: 'от 2 часов', price: 'по расчёту', km: 60 },
] as const;

/** Парк техники — из него считаются рейсы в калькуляторе */
export const TRUCKS = [
  { id: 'kamaz-10', title: 'Самосвал 10 т', capacity: 10, volume: 7 },
  { id: 'kamaz-20', title: 'Самосвал 20 т', capacity: 20, volume: 14 },
  { id: 'tonar-30', title: 'Шаланда 30 т', capacity: 30, volume: 21 },
] as const;

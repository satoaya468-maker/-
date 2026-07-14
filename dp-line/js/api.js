/* ============================================================
   Dp line · API-СЛОЙ
   Все страницы ходят за данными только через DP.api.*
   Сейчас функции читают моки из js/data.js c имитацией
   сетевой задержки. При подключении бэкенда достаточно
   заменить реализацию на fetch('/api/...') — сигнатуры
   (аргументы и форма ответа) остаются прежними.
   ============================================================ */

window.DP = window.DP || {};

(function () {
  const DB = window.DP_DB;

  /* Имитация сетевой задержки, чтобы UI честно проживал
     состояние загрузки (скелетоны) уже на моках. */
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  const netLag = () => delay(180 + Math.random() * 250);

  /* Нормализация артикула: '09.9772.11' -> '09977211' */
  const normArt = (s) => String(s || '').toUpperCase().replace(/[^A-ZА-Я0-9]/g, '');

  const minPrice = (p) => Math.min(...p.offers.map((o) => o.price));
  const minDays = (p) => Math.min(...p.offers.map((o) => o.days));

  /* Лучшее предложение: самое дешёвое среди самых быстрых разумных.
     Правило витрины: по умолчанию показываем минимальную цену. */
  const bestOffer = (p) => p.offers.reduce((a, b) => (b.price < a.price ? b : a));

  const clone = (x) => JSON.parse(JSON.stringify(x));

  function matchQuery(part, q) {
    const nq = normArt(q);
    const lq = q.toLowerCase();
    if (nq.length >= 3 && normArt(part.article).includes(nq)) return true;
    const hay = (part.brand + ' ' + part.name + ' ' + part.fits).toLowerCase();
    return lq.split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
  }

  DP.api = {

    /* --- Справочники --- */
    async getShop() { return clone(DB.shop); },
    async getPickup() { return clone(DB.pickup); },
    async getCategories() {
      return DB.categories.map((c) => ({
        ...c,
        count: DB.parts.filter((p) => p.cat === c.id).length,
      }));
    },
    async getVehicles() { return clone(DB.vehicles); },
    async getPopularQueries() { return clone(DB.popularQueries); },
    getSupplier(key) { return DB.suppliers[key] || { name: '—', city: '' }; },

    /* --- Поиск. params: { q, cat, vehicle, inStock, sort } --- */
    async searchParts(params = {}) {
      await netLag();
      let items = DB.parts.slice();
      const q = (params.q || '').trim();

      if (params.cat) items = items.filter((p) => p.cat === params.cat);

      if (params.vehicle) {
        const v = params.vehicle.toLowerCase();
        items = items.filter((p) => p.universal || p.fits.toLowerCase().includes(v));
      }

      let exact = [];
      if (q) {
        items = items.filter((p) => matchQuery(p, q));
        /* если запрос попал в артикул точно — подмешиваем кроссы */
        const nq = normArt(q);
        exact = items.filter((p) => normArt(p.article) === nq);
      }

      let analogs = [];
      if (exact.length) {
        const seen = new Set(items.map((p) => p.id));
        exact.forEach((p) => (p.analogs || []).forEach((id) => {
          if (!seen.has(id)) {
            const a = DB.parts.find((x) => x.id === id);
            if (a) { analogs.push(a); seen.add(id); }
          }
        }));
      }

      if (params.inStock) {
        items = items.filter((p) => p.offers.some((o) => o.days === 0));
        analogs = analogs.filter((p) => p.offers.some((o) => o.days === 0));
      }

      const sort = params.sort === 'fast'
        ? (a, b) => minDays(a) - minDays(b) || minPrice(a) - minPrice(b)
        : (a, b) => minPrice(a) - minPrice(b) || minDays(a) - minDays(b);
      items.sort(sort);
      analogs.sort(sort);

      const dress = (p) => ({ ...clone(p), best: bestOffer(p), offersCount: p.offers.length });
      return {
        items: items.map(dress),
        analogs: analogs.map(dress),
        total: items.length + analogs.length,
        offersTotal: [...items, ...analogs].reduce((s, p) => s + p.offers.length, 0),
      };
    },

    /* --- Карточка товара --- */
    async getPart(id) {
      await netLag();
      const p = DB.parts.find((x) => x.id === id);
      if (!p) return null;
      const part = clone(p);
      part.best = bestOffer(p);
      part.analogItems = (p.analogs || [])
        .map((aid) => DB.parts.find((x) => x.id === aid))
        .filter(Boolean)
        .map((a) => ({ ...clone(a), best: bestOffer(a), offersCount: a.offers.length }));
      return part;
    },

    /* --- Подборки для главной --- */
    async getPopularParts(limit = 8) {
      await netLag();
      return DB.parts.filter((p) => p.popular).slice(0, limit)
        .map((p) => ({ ...clone(p), best: bestOffer(p), offersCount: p.offers.length }));
    },

    /* --- Оформление заказа (мок): валидирует и возвращает номер --- */
    async submitOrder({ name, phone, email, comment, items }) {
      await delay(600);
      if (!name || !phone || !items || !items.length) {
        throw new Error('Не заполнены обязательные поля');
      }
      const num = 'DP-' + String(Math.floor(10000 + Math.random() * 90000));
      const order = { num, name, phone, email, comment, items, ts: Date.now() };
      try {
        const log = JSON.parse(localStorage.getItem('dpline.orders') || '[]');
        log.push(order);
        localStorage.setItem('dpline.orders', JSON.stringify(log));
      } catch (e) { /* приватный режим — заказ просто не сохранится локально */ }
      return { num };
    },
  };
})();

/**
 * Лиды. Всё, что оставляет телефон — заказ в 1 клик, расчёт сметы,
 * диалог с ИИ-менеджером — приходит сюда одной формой.
 *
 * Без подключённой CRM лид пишется в лог сервера: заявка не теряется
 * даже на витрине без интеграций.
 */

export type LeadSource =
  | 'hero'
  | 'one-click'
  | 'calculator'
  | 'cart'
  | 'chat'
  | 'callback';

export interface Lead {
  phone: string;
  name?: string;
  source: LeadSource;
  comment?: string;
  /** Что считал или клал в корзину — менеджеру это нужнее имени */
  context?: Record<string, unknown>;
  createdAt: string;
}

export interface LeadResult {
  ok: boolean;
  id: string;
  /** Через сколько перезвонит менеджер, минут */
  callbackMin: number;
}

/**
 * Отправка в CRM. Вебхук задаётся одной переменной — под Битрикс24,
 * amoCRM или любой приёмник, который умеет принимать JSON.
 *
 *   CRM_WEBHOOK_URL=https://...
 */
export async function submitLead(lead: Lead): Promise<LeadResult> {
  const id = `L-${Date.now().toString(36).toUpperCase()}`;
  const webhook = process.env.CRM_WEBHOOK_URL;

  if (!webhook) {
    console.info('[lead]', id, lead.source, lead.phone, lead.comment ?? '');
    return { ok: true, id, callbackMin: 15 };
  }

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, id }),
    });
    if (!res.ok) throw new Error(`CRM ответила ${res.status}`);
    return { ok: true, id, callbackMin: 15 };
  } catch (error) {
    // Лид дороже ошибки: логируем и всё равно подтверждаем приём
    console.error('[lead] CRM недоступна, заявка в логе', id, error);
    console.info('[lead]', id, JSON.stringify(lead));
    return { ok: true, id, callbackMin: 15 };
  }
}

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { stubReply, systemPrompt, type ChatMessage } from '@/lib/assistant';
import { normalizePhone } from '@/lib/phone';
import { submitLead } from '@/lib/leads';

/**
 * ИИ-менеджер. Работает через Claude API, а без ключа — на правиловом
 * резерве из `lib/assistant.ts`: виджет обязан продавать в любом случае.
 *
 * Включение: ANTHROPIC_API_KEY=sk-ant-...
 */

export const runtime = 'nodejs';

const MODEL = 'claude-opus-5';

/** Диалог с менеджером короткий — держим только последние ходы */
const MAX_HISTORY = 12;

interface ChatRequest {
  message?: unknown;
  history?: unknown;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== 'object' || value === null) return false;
  const m = value as Record<string, unknown>;
  return (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
}

function parseHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(isChatMessage)
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
}

/**
 * Телефон в реплике — это лид, даже если разговор на этом оборвётся.
 * Ловим его до вызова модели: ответ может не дойти, лид должен.
 */
async function captureLead(message: string, history: ChatMessage[]): Promise<void> {
  const match = message.match(/(?:\+?7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/);
  if (!match) return;
  const phone = normalizePhone(match[0]);
  if (phone.length !== 11) return;

  await submitLead({
    phone,
    source: 'chat',
    comment: 'Номер оставлен в чате с ИИ-менеджером',
    context: { transcript: history.slice(-4).map((m) => `${m.role}: ${m.content}`) },
    createdAt: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = (await request.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : '';
  if (!message) {
    return NextResponse.json({ error: 'Пустое сообщение' }, { status: 400 });
  }

  const history = parseHistory(body.history);

  // Лид фиксируем независимо от того, ответит модель или нет
  await captureLead(message, history);

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: stubReply(message, history), mode: 'stub' });
  }

  try {
    const client = new Anthropic();

    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 1024,
      // Ответ менеджера — три-четыре предложения, глубокое рассуждение здесь
      // только добавляет задержку. Мышление не выключаем: на Opus 5 это
      // роняет качество вызовов и формат ответа.
      output_config: { effort: 'low' },
      system: [
        {
          type: 'text',
          text: systemPrompt(),
          // Прайс и формулы одинаковы для всех — кешируем префикс
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [...history, { role: 'user', content: message }],
      betas: ['server-side-fallback-2026-06-01'],
      fallbacks: [{ model: 'claude-opus-4-8' }],
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({
        reply:
          'Это не моя тема — я по стройматериалам. Позвоните диспетчеру: +7 (3519) 55-04-04.',
        mode: 'refusal',
      });
    }

    const reply = response.content
      .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    return NextResponse.json({
      reply: reply || stubReply(message, history),
      mode: 'live',
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.error('[chat] лимит запросов', error.message);
    } else if (error instanceof Anthropic.AuthenticationError) {
      console.error('[chat] ключ отклонён', error.message);
    } else if (error instanceof Anthropic.APIError) {
      console.error(`[chat] ошибка API ${error.status}`, error.message);
    } else {
      console.error('[chat] непредвиденная ошибка', error);
    }
    // Ни одна ошибка модели не должна обрывать разговор с покупателем
    return NextResponse.json({ reply: stubReply(message, history), mode: 'fallback' });
  }
}

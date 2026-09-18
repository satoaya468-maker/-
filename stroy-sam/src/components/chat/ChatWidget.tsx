'use client';

import { useEffect, useRef, useState } from 'react';
import { Mascot } from './Mascot';
import { ASSISTANT_NAME, GREETING, QUICK_REPLIES, type ChatMessage } from '@/lib/assistant';

/**
 * Плавающий чат с ИИ-менеджером.
 *
 * Открыт вопрос, кому звонить в 6 утра — поэтому Семёныч всегда на экране.
 * На мобильном разворачивается на весь экран: на 360 px окошко в углу
 * нечитаемо, а именно оттуда приходит большая часть трафика.
 */

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [teaser, setTeaser] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Подсказка появляется один раз и только если виджет не трогали
  useEffect(() => {
    const t = setTimeout(() => setTeaser(true), 9000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (open) {
      setTeaser(false);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const history = messages;
    setMessages((m) => [...m, { role: 'user', content: trimmed }]);
    setInput('');
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            data.reply ??
            'Связь подвела. Наберите диспетчера напрямую: +7 (3519) 55-04-04.',
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Связь подвела. Наберите диспетчера напрямую: +7 (3519) 55-04-04.',
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Кнопка вызова */}
      <div className="fixed bottom-4 right-4 z-chat flex flex-col items-end gap-2.5 md:bottom-6 md:right-6">
        {teaser && !open && (
          <div className="relative max-w-[250px] rounded-[14px] rounded-br-sm bg-surface px-3.5 py-2.5 shadow-e3">
            <button
              type="button"
              onClick={() => setTeaser(false)}
              aria-label="Скрыть подсказку"
              className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-graphite-950 text-white"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <p className="text-[13px] leading-snug text-ink">
              Не знаете, сколько нужно материала? Спросите — посчитаю за минуту.
            </p>
          </div>
        )}

        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative flex h-16 w-16 items-center justify-center rounded-full bg-hv shadow-e4 transition-transform duration-200 ease-out-quart hover:scale-[1.05] active:scale-95"
          >
            <span className="sr-only">Открыть чат с менеджером {ASSISTANT_NAME}</span>
            <Mascot className="h-14 w-14" />
            <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-bg bg-stock" />
          </button>
        )}
      </div>

      {/* Панель диалога */}
      {open && (
        <div
          role="dialog"
          aria-label={`Чат с менеджером ${ASSISTANT_NAME}`}
          className="fixed inset-0 z-chat flex flex-col bg-surface sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[560px] sm:max-h-[calc(100vh-48px)] sm:w-[386px] sm:rounded-2xl sm:shadow-e4"
        >
          <header className="flex shrink-0 items-center gap-3 rounded-t-2xl bg-graphite-950 px-4 py-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-hv">
              <Mascot className="h-10 w-10" thinking={busy} />
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[15px] font-bold text-white">{ASSISTANT_NAME}</p>
              <p className="flex items-center gap-1.5 text-[12px] text-white/60">
                <span className="h-1.5 w-1.5 rounded-full bg-stock" />
                {busy ? 'Считает…' : 'Менеджер базы · отвечает сразу'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto bg-bg px-4 py-4"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <p
                  className={`max-w-[85%] whitespace-pre-line rounded-[14px] px-3.5 py-2.5 text-[14px] leading-relaxed ${
                    m.role === 'user'
                      ? 'rounded-br-sm bg-graphite-950 text-white'
                      : 'rounded-bl-sm bg-surface text-ink shadow-e1'
                  }`}
                >
                  {m.content}
                </p>
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <p className="flex items-center gap-1.5 rounded-[14px] rounded-bl-sm bg-surface px-3.5 py-3 shadow-e1">
                  <span className="sr-only">{ASSISTANT_NAME} печатает ответ</span>
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-faint"
                      style={{ animationDelay: `${d * 140}ms` }}
                    />
                  ))}
                </p>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto border-t border-line bg-surface px-4 py-2.5">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="h-8 shrink-0 rounded-full border border-line-strong px-3 text-[12.5px] font-medium text-ink transition-colors hover:border-graphite-950"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex shrink-0 items-center gap-2 border-t border-line bg-surface px-3 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:rounded-b-2xl"
          >
            <label htmlFor="chat-input" className="sr-only">
              Сообщение менеджеру
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Размеры площадки или телефон…"
              className="h-11 min-w-0 flex-1 rounded-[10px] border border-line-strong bg-surface px-3.5 text-[15px] text-ink outline-none placeholder:text-ink-faint focus:border-graphite-950"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Отправить"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] bg-hv text-hv-ink transition-colors hover:bg-hv-deep disabled:opacity-40"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true" fill="currentColor">
                <path d="M2.4 17.6L18.5 10 2.4 2.4 2.4 8.3l11.5 1.7-11.5 1.7z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

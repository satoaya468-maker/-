import { NextResponse } from 'next/server';
import { submitLead, type LeadSource } from '@/lib/leads';
import { isValidPhone, normalizePhone } from '@/lib/phone';

/** Приём заявок из героя, калькулятора и формы обратного звонка. */

export const runtime = 'nodejs';

const SOURCES: LeadSource[] = ['hero', 'one-click', 'calculator', 'cart', 'chat', 'callback'];

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });
  }

  const phone = typeof body.phone === 'string' ? body.phone : '';
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: 'Проверьте номер телефона' }, { status: 400 });
  }

  const source = SOURCES.includes(body.source as LeadSource)
    ? (body.source as LeadSource)
    : 'callback';

  const result = await submitLead({
    phone: normalizePhone(phone),
    name: typeof body.name === 'string' ? body.name.slice(0, 120) : undefined,
    source,
    comment: typeof body.comment === 'string' ? body.comment.slice(0, 600) : undefined,
    context: typeof body.context === 'object' && body.context !== null
      ? (body.context as Record<string, unknown>)
      : undefined,
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json(result);
}

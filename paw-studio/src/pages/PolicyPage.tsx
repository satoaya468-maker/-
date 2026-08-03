import { useEffect } from 'react';
import { site } from '@/data/site';

const sections = [
  {
    title: 'Какие данные мы собираем',
    text: 'Только те, что вы сами оставляете в форме записи: имя, номер телефона, кличку и породу питомца, примерный вес, желаемую услугу и дату, а также комментарий, если вы его написали.',
  },
  {
    title: 'Зачем они нужны',
    text: 'Чтобы связаться с вами, согласовать время и подготовить мастера к визиту. Мы не используем эти данные для рассылок и не передаём их третьим лицам, кроме случаев, прямо предусмотренных законом.',
  },
  {
    title: 'Сколько мы их храним',
    text: 'Историю визитов держим три года: она помогает помнить особенности питомца и не спрашивать одно и то же каждый раз. Заявки, не превратившиеся в запись, удаляем через шесть месяцев.',
  },
  {
    title: 'Как отозвать согласие',
    text: `Напишите на ${site.email} или скажите об этом по телефону. Мы удалим данные в течение трёх рабочих дней и подтвердим удаление.`,
  },
  {
    title: 'Куки и аналитика',
    text: 'Сайт использует технические файлы cookie, необходимые для его работы, и обезличенную статистику посещений. Персональные данные из аналитики мы не извлекаем.',
  },
] as const;

export function PolicyPage() {
  useEffect(() => {
    document.title = 'Политика обработки персональных данных — Paw Studio';
  }, []);

  return (
    <div className="container-page pt-[104px] pb-[clamp(4rem,7vw,6.5rem)] sm:pt-[124px]">
      <div className="max-w-[38rem]">
        <h1 className="heading-section">Политика обработки персональных данных</h1>
        <p className="text-lead mt-4 text-muted">
          Коротко и по делу: что мы собираем через форму записи, зачем и как это удалить.
        </p>

        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-display mt-10 text-[1.375rem] leading-tight font-[540] tracking-[-0.014em]">
              {section.title}
            </h2>
            <p className="mt-3 text-ink-soft">{section.text}</p>
          </section>
        ))}

        <p className="text-caption hairline-t mt-12 pt-6 text-muted">
          Оператор данных: {site.legal.entity}, {site.legal.inn}. {site.city}, {site.address}.
        </p>
      </div>
    </div>
  );
}

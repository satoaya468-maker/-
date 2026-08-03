import { photos, type PhotoSlot } from './photos';

export interface TeamMember {
  name: string;
  role: string;
  experience: string;
  focus: string;
  note: string;
  photo: PhotoSlot;
}

export const team: readonly TeamMember[] = [
  {
    name: 'Анна Соколова',
    role: 'Основатель, старший грумер',
    experience: '11 лет в груминге',
    focus: 'Выставочные стрижки, пудели и бишоны',
    note: 'Училась у финалистов конкурса «Грумер года», судит шоу молодых мастеров.',
    photo: photos.team1,
  },
  {
    name: 'Мария Ким',
    role: 'Грумер-фелинолог',
    experience: '7 лет в груминге',
    focus: 'Кошки, тревожные и возрастные животные',
    note: 'Говорит, что с кошкой главное — не торопить первые десять минут. Остальное — техника.',
    photo: photos.team2,
  },
  {
    name: 'Дмитрий Орлов',
    role: 'Мастер по триммингу',
    experience: '9 лет в груминге',
    focus: 'Жесткошёрстные: таксы, шнауцеры, терьеры',
    note: 'Пришёл из кинологии; ведёт породные семинары для владельцев.',
    photo: photos.team3,
  },
  {
    name: 'Ольга Виноградова',
    role: 'Грумер, ветфельдшер',
    experience: '5 лет в груминге',
    focus: 'SPA-программы и деликатный уход',
    note: 'Ветеринарное образование помогает заметить то, что скрыто под шерстью, и вовремя посоветовать врача.',
    photo: photos.team4,
  },
] as const;

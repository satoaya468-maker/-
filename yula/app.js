/* ЮЛА — общий скрипт: бургер-меню, тосты, цифровой ассистент Ascend Systems */

/* ——— Бургер ——— */
document.addEventListener('click', function (e) {
  var b = e.target.closest('[data-burger]');
  if (b) {
    var menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('is-open');
  }
});

/* ——— Тосты ——— */
function ascendToast(line1, line2, line3, ms) {
  var stack = document.getElementById('toastStack');
  if (!stack) return;
  var el = document.createElement('div');
  el.className = 'toast';
  var t1 = document.createElement('div'); t1.className = 't1'; t1.textContent = line1;
  var t2 = document.createElement('div'); t2.className = 't2'; t2.textContent = line2;
  el.appendChild(t1); el.appendChild(t2);
  if (line3) { var t3 = document.createElement('div'); t3.className = 't3'; t3.textContent = line3; el.appendChild(t3); }
  stack.appendChild(el);
  setTimeout(function () { el.remove(); }, ms || 7000);
}

/* ——— Telegram-заглушка (интеграция Ascend Systems) ——— */
function sendToTelegram(payload) {
  const TOKEN = 'YOUR_BOT_TOKEN';
  const CHAT_ID = 'YOUR_CHAT_ID';
  const text = Object.keys(payload).map(function (k) { return k + ': ' + payload[k]; }).join('\n');
  console.log('[Ascend Systems → Telegram]', text);
  if (TOKEN === 'YOUR_BOT_TOKEN') return Promise.resolve();
  return fetch('https://api.telegram.org/bot' + TOKEN + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: text })
  }).catch(function () {});
}

/* ——— Чат-ассистент «Юля» ——— */
(function () {
  var launcher = document.getElementById('widgetLauncher');
  var panel = document.getElementById('chatPanel');
  if (!launcher || !panel) return;

  var body = document.getElementById('chatBody');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var started = false;
  var step = 0;
  var answers = { age: '', date: '', phone: '' };

  var SCRIPT = [
    'Здравствуйте! Меня зовут Юля, помогу забронировать праздник. Сколько лет исполняется малышу?',
    'Отлично! На какую дату планируете и сколько будет детей?',
    'Записала. Подберу подходящий пакет и пришлю в WhatsApp свободные даты с ценами. Оставьте номер — свяжусь в течение часа.',
    'Спасибо! Свяжусь с вами в WhatsApp в течение часа. Хорошего дня!'
  ];

  function scroll() { body.scrollTop = body.scrollHeight; }

  function addBubble(text, who) {
    var el = document.createElement('div');
    el.className = 'bubble ' + who;
    el.textContent = text;
    body.appendChild(el);
    scroll();
  }

  function addTyping() {
    var el = document.createElement('div');
    el.className = 'typing';
    el.id = 'typingDots';
    el.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(el);
    scroll();
    return el;
  }

  function botSay(text, delay) {
    var dots = addTyping();
    setTimeout(function () {
      dots.remove();
      addBubble(text, 'bot');
    }, delay);
  }

  function open() {
    panel.classList.add('is-open');
    launcher.style.display = 'none';
    if (!started) {
      started = true;
      botSay(SCRIPT[0], 600);
    }
    setTimeout(function () { input.focus(); }, 200);
  }

  function close() {
    panel.classList.remove('is-open');
    launcher.style.display = '';
  }

  launcher.addEventListener('click', open);
  document.getElementById('chatClose').addEventListener('click', close);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var value = input.value.trim();
    if (!value) return;
    addBubble(value, 'user');
    input.value = '';

    if (step === 0) {
      answers.age = value;
      step = 1;
      botSay(SCRIPT[1], 1200);
    } else if (step === 1) {
      answers.date = value;
      step = 2;
      botSay(SCRIPT[2], 1400);
    } else if (step === 2) {
      answers.phone = value;
      step = 3;
      var masked = value.replace(/\d/g, 'X');
      ascendToast(
        'ASCEND SYSTEMS · CRM',
        'Заявка на праздник зафиксирована',
        'Передано администратору Юла · ' + masked,
        7000
      );
      sendToTelegram({
        'Источник': 'Сайт Юла — чат-ассистент',
        'Возраст ребёнка': answers.age,
        'Дата и количество детей': answers.date,
        'Телефон': answers.phone
      });
      botSay(SCRIPT[3], 1000);
    } else {
      botSay('Всё записала, до связи!', 1000);
    }
  });
})();

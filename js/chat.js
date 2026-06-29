/* ============================================================
   Балкон для души — concierge chat widget
   Client-side assistant: answers common questions and hands off
   to WhatsApp / VK / phone with the message pre-filled.
   No backend required.
   ============================================================ */
(function () {
  "use strict";

  var PHONE_DISPLAY = "+7 (982) 328-38-57";
  var PHONE_TEL = "+79823283857";
  var WA = "79823283857";
  var VK = "https://vk.com/balcondlyadushi";

  /* ---------- contact action buttons ---------- */
  function ctas(prefill) {
    var t = prefill ? "?text=" + encodeURIComponent(prefill) : "";
    return (
      '<div class="msg__ctas">' +
        '<a class="chat-cta" href="https://wa.me/' + WA + t + '" target="_blank" rel="noopener">' +
          '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6-.3.3c-.2.2-.4.4-.2.7.2.4.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.6 1.6.3.1.5.1.7-.1l.8-.9c.2-.3.4-.2.7-.1l1.9.9c.3.2.5.2.5.4.1.2.1.8-.1 1.4Z"/></svg>' +
          'WhatsApp' +
        '</a>' +
        '<a class="chat-cta chat-cta--ghost" href="tel:' + PHONE_TEL + '">Позвонить</a>' +
        '<a class="chat-cta chat-cta--ghost" href="' + VK + '" target="_blank" rel="noopener">ВКонтакте</a>' +
      '</div>'
    );
  }

  /* ---------- intents ---------- */
  var INTENTS = [
    { keys: ["привет", "здравств", "добр", "хай", "ало", "алло"],
      a: "Рад знакомству! 😊 Подскажу по остеклению, отделке, утеплению и срокам. Что вас интересует?" },

    { keys: ["цена", "цены", "стоим", "сколько", "расчет", "расчёт", "прайс", "бюджет", "смет", "дорог", "дешев"],
      a: "Стоимость зависит от размеров балкона, типа остекления и объёма отделки. Чтобы назвать точную цифру — нужен <b>бесплатный замер</b>. Опишите балкон (тип, размер) прямо здесь или оставьте номер — мастер рассчитает смету в день обращения.",
      cta: "Здравствуйте! Хочу рассчитать стоимость балкона." },

    { keys: ["срок", "когда", "быстро", "время", "дней", "долго", "успе"],
      a: "Остекление — обычно <b>1 день</b>. Отделка «под ключ» — <b>от 3 до 7 дней</b> в зависимости от объёма. Точные сроки назовём после замера.",
      cta: "Здравствуйте! Подскажите сроки по моему балкону." },

    { keys: ["остекл", "окно", "окна", "стекл", "пвх", "холодн", "тепл", "панорам", "алюмин", "раздвиж"],
      a: "Делаем <b>тёплое и холодное остекление</b>: ПВХ и алюминий, распашные, раздвижные и панорамные конструкции. Подберём решение под ваш балкон и бюджет.",
      cta: "Здравствуйте! Интересует остекление балкона." },

    { keys: ["под ключ", "обшив", "отделк", "ремонт", "ламинат", "панел", "вагонк", "пол ", "потол", "стен"],
      a: "<b>Балкон под ключ</b>: остекление, утепление, электрика, отделка стен / пола / потолка, шкафы и освещение — одна бригада от замера до финальной уборки.",
      cta: "Здравствуйте! Нужен балкон под ключ." },

    { keys: ["утепл", "холодно", "мёрзн", "мерзн", "тёпл пол", "теплый пол", "тёплый пол"],
      a: "Утепляем пол, стены и потолок (пеноплэкс / минвата + пароизоляция), при желании — <b>тёплый пол</b>. Балкон становится полноценной тёплой комнатой круглый год.",
      cta: "Здравствуйте! Хочу утеплить балкон." },

    { keys: ["объедин", "совмещ", "кухн", "комнат", "снос", "присоедин"],
      a: "Объединяем балкон с комнатой или кухней «под ключ» с учётом норм: демонтаж, утепление, выравнивание, тёплый пол и чистовая отделка.",
      cta: "Здравствуйте! Интересует объединение балкона с комнатой." },

    { keys: ["электр", "розетк", "свет", "освещ", "проводк", "лед", "подсветк"],
      a: "Проводим <b>электрику на балконе</b>: розетки, выключатели, LED-подсветку, тёплый пол и продуманные сценарии освещения.",
      cta: "Здравствуйте! Нужна электрика на балконе." },

    { keys: ["гаранти", "надёжн", "надежн", "качеств", "договор", "доплат"],
      a: "Даём <b>гарантию на все работы и материалы</b>. Работаем по договору и фиксируем стоимость до старта — без доплат «по ходу».",
      cta: "Здравствуйте! Вопрос по гарантии и договору." },

    { keys: ["магнитогорск", "район", "выезд", "адрес", "где", "город", "приедет"],
      a: "Работаем по всему <b>Магнитогорску</b> и пригороду. Замер бесплатный — мастер приезжает к вам в удобное время.",
      cta: "Здравствуйте! Запишите меня на бесплатный замер." },

    { keys: ["спасиб", "благодар", "ок", "понятно", "класс", "супер"],
      a: "Всегда рады помочь! 🙌 Оставьте номер — перезвоним и бесплатно проконсультируем.",
      cta: "Здравствуйте! Перезвоните мне, пожалуйста." },

    { keys: ["связ", "телефон", "позвон", "написать", "whatsapp", "ватсап", "вк ", "вконтакте", "контакт", "номер"],
      a: "Выберите удобный способ связи — отвечаем быстро 👇",
      cta: "Здравствуйте! Пишу с сайта «Балкон для души»." }
  ];

  var FALLBACK = {
    a: "Спасибо за вопрос! Лучше всего ответит наш мастер. Напишите в WhatsApp или ВКонтакте — отвечаем быстро, либо оставьте номер для звонка.",
    cta: "Здравствуйте! У меня вопрос по балкону: "
  };

  function match(text) {
    var t = " " + text.toLowerCase().replace(/ё/g, "ё") + " ";
    for (var i = 0; i < INTENTS.length; i++) {
      var it = INTENTS[i];
      for (var k = 0; k < it.keys.length; k++) {
        if (t.indexOf(it.keys[k]) !== -1) return it;
      }
    }
    return null;
  }

  /* ---------- build widget ---------- */
  var fab = document.createElement("button");
  fab.className = "chat-fab";
  fab.setAttribute("aria-label", "Открыть чат");
  fab.innerHTML =
    '<span class="chat-fab__icon"><span class="chat-fab__dot"></span>' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z"/></svg>' +
    '</span><span>Задать вопрос</span>';

  var panel = document.createElement("div");
  panel.className = "chat-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Чат с компанией Балкон для души");
  panel.innerHTML =
    '<div class="chat-head">' +
      '<div class="chat-head__avatar"><i></i>' +
        '<svg viewBox="0 0 64 64"><path d="M22 16h20a4 4 0 0 1 4 4v28a2 2 0 0 1-3.2 1.6L32 41.5l-10.8 8.1A2 2 0 0 1 18 48V20a4 4 0 0 1 4-4Z" fill="#0B0B0D"/></svg>' +
      '</div>' +
      '<div class="chat-head__info"><b>Балкон для души</b><span><i style="width:7px;height:7px;border-radius:50%;background:#34d058;display:inline-block"></i> Онлайн · отвечаем быстро</span></div>' +
      '<button class="chat-head__close" aria-label="Закрыть чат"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
    '</div>' +
    '<div class="chat-body" id="chat-body"></div>' +
    '<div class="chat-quick" id="chat-quick"></div>' +
    '<form class="chat-foot" id="chat-foot">' +
      '<input type="text" id="chat-input" placeholder="Напишите сообщение…" autocomplete="off" aria-label="Сообщение">' +
      '<button type="submit" aria-label="Отправить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg></button>' +
    '</form>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var body = panel.querySelector("#chat-body");
  var quick = panel.querySelector("#chat-quick");
  var input = panel.querySelector("#chat-input");
  var foot = panel.querySelector("#chat-foot");

  var QUICK = [
    "Рассчитать стоимость", "Сроки работ", "Остекление",
    "Балкон под ключ", "Гарантия", "Связаться"
  ];

  function renderQuick() {
    quick.innerHTML = "";
    QUICK.forEach(function (q) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = q;
      b.addEventListener("click", function () { handle(q); });
      quick.appendChild(b);
    });
  }

  function scrollDown() { body.scrollTop = body.scrollHeight; }

  function addMsg(html, who) {
    var m = document.createElement("div");
    m.className = "msg msg--" + who;
    m.innerHTML = html;
    body.appendChild(m);
    scrollDown();
    return m;
  }

  function typing(done) {
    var t = document.createElement("div");
    t.className = "chat-typing";
    t.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(t);
    scrollDown();
    setTimeout(function () { t.remove(); done(); }, 650 + Math.random() * 450);
  }

  function botReply(intent, userText) {
    typing(function () {
      var ans = intent ? intent.a : FALLBACK.a;
      var pre = intent ? intent.cta : (FALLBACK.cta + (userText || ""));
      addMsg(ans + (pre !== undefined ? ctas(pre) : ""), "bot");
    });
  }

  function handle(text) {
    text = (text || "").trim();
    if (!text) return;
    addMsg(escapeHtml(text), "user");
    botReply(match(text), text);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* ---------- open / close ---------- */
  var greeted = false;
  function greet() {
    if (greeted) return;
    greeted = true;
    typing(function () {
      addMsg("Здравствуйте! 👋 Это <b>«Балкон для души»</b> — отделка и остекление балконов в Магнитогорске. Подскажу по услугам, срокам и стоимости. С чего начнём?", "bot");
      renderQuick();
    });
  }
  function open() { document.body.classList.add("chat-open"); greet(); setTimeout(function () { input.focus(); }, 420); }
  function close() { document.body.classList.remove("chat-open"); }

  fab.addEventListener("click", open);
  panel.querySelector(".chat-head__close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("chat-open")) close();
  });

  foot.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value;
    input.value = "";
    handle(v);
  });

  /* let "Связаться" CTA buttons elsewhere on the page open the chat */
  document.querySelectorAll("[data-open-chat]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); open(); });
  });
})();

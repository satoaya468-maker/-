/* ==========================================================================
   КРАСИВОЕ ЖЕЛЕЗО — main.js
   Только vanilla JS + IntersectionObserver. Без библиотек и сборки.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.remove('no-js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Настройки, которые меняются вместе с реальными контактами ---------- */
  var CFG = {
    // ВНИМАНИЕ: телефон-плейсхолдер. Заменить на реальный в этом объекте,
    // в HTML (tel:, ссылки WhatsApp) и в JSON-LD.
    waNumber: '79097490000',
    endpoint: 'send.php',
    maxFiles: 5,
    maxSize: 20 * 1024 * 1024,
    allowed: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'dxf', 'dwg']
  };

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  /* ======================================================================
     1. Мобильное меню
     ====================================================================== */
  (function menu() {
    var burger = $('.burger');
    var panel = $('#menu');
    if (!burger || !panel) return;

    function set(open) {
      burger.setAttribute('aria-expanded', String(open));
      panel.dataset.open = String(open);
      doc.body.style.overflow = open ? 'hidden' : '';
    }

    burger.addEventListener('click', function () {
      set(burger.getAttribute('aria-expanded') !== 'true');
    });

    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) set(false);
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        set(false);
        burger.focus();
      }
    });
  })();

  /* ======================================================================
     2. Появление секций
     ====================================================================== */
  (function reveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    items.forEach(function (el, i) {
      // Лёгкая лесенка внутри одной группы.
      var group = el.parentElement;
      var idx = group ? Array.prototype.indexOf.call(group.children, el) : i;
      el.style.setProperty('--delay', Math.min(idx, 5) * 55 + 'ms');
      io.observe(el);
    });
  })();

  /* ======================================================================
     3. Счётчики
     ====================================================================== */
  (function counters() {
    var nodes = $$('[data-count]');
    if (!nodes.length) return;

    function render(el, value) {
      var decimals = parseInt(el.dataset.decimals || '0', 10);
      var text = value.toFixed(decimals).replace('.', ',');
      // Пишем только в первый текстовый узел, чтобы не затирать вложенные <small>.
      if (el.firstChild && el.firstChild.nodeType === 3) {
        el.firstChild.nodeValue = text;
      } else {
        el.textContent = text;
      }
    }

    function run(el) {
      var target = parseFloat(el.dataset.count);
      if (reduced) { render(el, target); return; }

      var dur = 1100;
      var start = performance.now();

      (function tick(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        render(el, target * eased);
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    }

    if (!('IntersectionObserver' in window)) {
      nodes.forEach(function (el) { render(el, parseFloat(el.dataset.count)); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    nodes.forEach(function (el) {
      render(el, 0);
      io.observe(el);
    });
  })();

  /* ======================================================================
     4. Линия лазера + параллакс hero
     ====================================================================== */
  (function laser() {
    if (reduced) return;

    var sections = $$('[data-laser]');
    var heroImg = $('.hero__bg img');
    if (!sections.length && !heroImg) return;

    var active = [];
    var ticking = false;

    function frame() {
      ticking = false;
      var vh = window.innerHeight;

      active.forEach(function (el) {
        var r = el.getBoundingClientRect();
        var p = (vh - r.top) / (vh + r.height);
        el.style.setProperty('--laser', Math.max(0, Math.min(1, p)).toFixed(4));
      });

      if (heroImg) {
        var hr = heroImg.parentElement.getBoundingClientRect();
        if (hr.bottom > 0 && hr.top < vh) {
          var shift = Math.min(window.scrollY * 0.16, 90);
          heroImg.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0) scale(1.08)';
        }
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(frame);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var el = entry.target;
          if (entry.isIntersecting) {
            if (active.indexOf(el) === -1) active.push(el);
            el.style.setProperty('--laser-on', '1');
          } else {
            active = active.filter(function (n) { return n !== el; });
            el.style.setProperty('--laser-on', '0');
          }
        });
        onScroll();
      }, { threshold: 0 });
      sections.forEach(function (el) { io.observe(el); });
    } else {
      active = sections;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  })();

  /* ======================================================================
     5. Форма чертежа: drag & drop, валидация, отправка
     ====================================================================== */
  (function quote() {
    var form = $('#quote-form');
    if (!form) return;

    var zone = $('#dropzone');
    var input = $('#draft-file');
    var list = $('#file-list');
    var result = $('#quote-result');
    var submit = $('#quote-submit');
    var progress = $('#quote-progress');
    var progressBar = progress ? progress.querySelector('i') : null;
    var waBtn = $('#wa-send');
    var files = [];

    // Метка времени открытия формы — быстрое заполнение отсекается на сервере.
    var ts = $('#form-ts');
    if (ts) ts.value = String(Date.now());

    /* ---- вспомогательное ---- */
    function fmtSize(bytes) {
      if (bytes < 1024) return bytes + ' Б';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' КБ';
      return (bytes / 1024 / 1024).toFixed(1).replace('.', ',') + ' МБ';
    }

    function ext(name) {
      var m = /\.([a-z0-9]+)$/i.exec(name);
      return m ? m[1].toLowerCase() : '';
    }

    function setFieldError(field, message) {
      var wrap = field.closest('.field') || field.closest('.consent');
      if (!wrap) return;
      wrap.classList.toggle('field--error', Boolean(message));
      var slot = wrap.querySelector('.field__err');
      if (slot) slot.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function showResult(state, title, text) {
      if (!result) return;
      result.dataset.state = state;
      $('.result__title', result).textContent = title;
      $('.result__text', result).textContent = text;
      result.setAttribute('tabindex', '-1');
      result.focus({ preventScroll: true });
      result.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    }

    /* ---- список файлов ---- */
    function renderFiles() {
      list.innerHTML = '';

      files.forEach(function (file, i) {
        var row = doc.createElement('div');
        row.className = 'file';

        var badge = doc.createElement('span');
        badge.className = 'file__ext';
        badge.textContent = ext(file.name) || 'файл';

        var meta = doc.createElement('span');
        meta.className = 'file__meta';
        var name = doc.createElement('span');
        name.className = 'file__name';
        name.textContent = file.name;
        var size = doc.createElement('span');
        size.className = 'file__size';
        size.textContent = fmtSize(file.size);
        meta.appendChild(name);
        meta.appendChild(size);

        var kill = doc.createElement('button');
        kill.type = 'button';
        kill.className = 'file__drop';
        kill.setAttribute('aria-label', 'Убрать файл ' + file.name);
        kill.innerHTML = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.6 1.4 1.4 2.6 6.8 8l-5.4 5.4 1.2 1.2L8 9.2l5.4 5.4 1.2-1.2L9.2 8l5.4-5.4-1.2-1.2L8 6.8z"/></svg>';
        kill.addEventListener('click', function () {
          files.splice(i, 1);
          renderFiles();
        });

        row.appendChild(badge);
        row.appendChild(meta);
        row.appendChild(kill);

        if (/^image\//.test(file.type)) {
          var img = doc.createElement('img');
          img.className = 'file__thumb';
          img.alt = 'Превью файла ' + file.name;
          img.src = URL.createObjectURL(file);
          img.addEventListener('load', function () { URL.revokeObjectURL(img.src); });
          row.appendChild(img);
        }

        list.appendChild(row);
      });

      var counter = $('#file-count');
      if (counter) {
        counter.textContent = files.length
          ? 'Прикреплено: ' + files.length + ' из ' + CFG.maxFiles
          : '';
      }
    }

    function addFiles(incoming) {
      var errors = [];

      Array.prototype.forEach.call(incoming, function (file) {
        if (files.length >= CFG.maxFiles) {
          errors.push('Максимум ' + CFG.maxFiles + ' файлов за раз.');
          return;
        }
        if (CFG.allowed.indexOf(ext(file.name)) === -1) {
          errors.push(file.name + ' — формат не подходит.');
          return;
        }
        if (file.size > CFG.maxSize) {
          errors.push(file.name + ' — больше 20 МБ.');
          return;
        }
        var dup = files.some(function (f) { return f.name === file.name && f.size === file.size; });
        if (!dup) files.push(file);
      });

      renderFiles();

      var slot = $('#file-error');
      if (slot) slot.textContent = errors.length ? errors[0] : '';
    }

    /* ---- drag & drop ---- */
    if (zone && input) {
      ['dragenter', 'dragover'].forEach(function (type) {
        zone.addEventListener(type, function (e) {
          e.preventDefault();
          zone.classList.add('is-dragover');
        });
      });

      ['dragleave', 'dragend', 'drop'].forEach(function (type) {
        zone.addEventListener(type, function (e) {
          e.preventDefault();
          if (type === 'dragleave' && zone.contains(e.relatedTarget)) return;
          zone.classList.remove('is-dragover');
        });
      });

      zone.addEventListener('drop', function (e) {
        if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
      });

      input.addEventListener('change', function () {
        if (input.files.length) addFiles(input.files);
        input.value = '';
      });

      // Клик по всей зоне, кроме самих файлов и кнопок внутри.
      zone.addEventListener('click', function (e) {
        if (e.target.closest('.file') || e.target.closest('button')) return;
        input.click();
      });

      var pick = $('#file-pick');
      if (pick) {
        pick.addEventListener('click', function () { input.click(); });
      }
    }

    /* ---- валидация ---- */
    function validate() {
      var ok = true;

      var name = form.elements.name;
      if (!name.value.trim() || name.value.trim().length < 2) {
        setFieldError(name, 'Как к вам обращаться?');
        ok = false;
      } else setFieldError(name, '');

      var phone = form.elements.phone;
      var digits = phone.value.replace(/\D/g, '');
      if (digits.length < 10) {
        setFieldError(phone, 'Телефон: 10 цифр минимум');
        ok = false;
      } else setFieldError(phone, '');

      var consent = form.elements.consent;
      if (consent && !consent.checked) {
        setFieldError(consent, 'Нужно согласие на обработку данных');
        ok = false;
      } else if (consent) setFieldError(consent, '');

      if (!ok) {
        var bad = form.querySelector('.field--error input, .field--error select, .field--error textarea, .field--error [type="checkbox"]');
        if (bad) bad.focus();
      }
      return ok;
    }

    /* ---- маска телефона (мягкая, не мешает вставке) ---- */
    var phoneInput = form.elements.phone;
    if (phoneInput) {
      phoneInput.addEventListener('input', function () {
        var d = phoneInput.value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
        if (!d) { phoneInput.value = ''; return; }
        if (d[0] !== '7') d = '7' + d.slice(0, 10);
        var out = '+7';
        if (d.length > 1) out += ' ' + d.slice(1, 4);
        if (d.length > 4) out += ' ' + d.slice(4, 7);
        if (d.length > 7) out += '-' + d.slice(7, 9);
        if (d.length > 9) out += '-' + d.slice(9, 11);
        phoneInput.value = out;
      });
    }

    /* ---- таймер «ответим за час» ---- */
    function startTimer() {
      var el = $('#quote-timer');
      if (!el) return;
      var left = 60 * 60;

      function paint() {
        var m = Math.floor(left / 60);
        var s = left % 60;
        el.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }
      paint();
      if (reduced) return;
      var id = setInterval(function () {
        left -= 1;
        if (left < 0) { clearInterval(id); el.textContent = '00:00'; return; }
        paint();
      }, 1000);
    }

    /* ---- отправка ---- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) return;

      var data = new FormData(form);
      files.forEach(function (file) { data.append('files[]', file, file.name); });
      data.append('page', location.pathname);

      var xhr = new XMLHttpRequest();
      xhr.open('POST', CFG.endpoint, true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

      submit.dataset.state = 'sending';
      var label = submit.querySelector('.btn__label');
      var original = label ? label.textContent : '';
      if (label) label.textContent = 'Отправляем…';
      if (progress) progress.dataset.on = 'true';
      if (result) result.dataset.state = '';

      xhr.upload.addEventListener('progress', function (ev) {
        if (!progressBar || !ev.lengthComputable) return;
        progressBar.style.width = Math.round((ev.loaded / ev.total) * 100) + '%';
      });

      function finish() {
        submit.dataset.state = '';
        if (label) label.textContent = original;
        if (progress) progress.dataset.on = 'false';
        if (progressBar) progressBar.style.width = '0%';
      }

      xhr.addEventListener('load', function () {
        finish();
        var res = null;
        try { res = JSON.parse(xhr.responseText); } catch (err) { res = null; }

        if (xhr.status === 200 && res && res.ok) {
          form.reset();
          files = [];
          renderFiles();
          showResult(
            'ok',
            'Заявка у мастера',
            'Чертёж ушёл в цех. Считаем и перезваниваем — обычно быстрее, чем за час.'
          );
          startTimer();
        } else {
          showResult(
            'err',
            'Не отправилось',
            (res && res.error) || 'Что-то с соединением. Продублируйте в WhatsApp — так дойдёт точно.'
          );
        }
      });

      xhr.addEventListener('error', function () {
        finish();
        showResult('err', 'Не отправилось', 'Нет связи с сервером. Отправьте чертёж в WhatsApp — ответим так же быстро.');
      });

      xhr.send(data);
    });

    /* ---- дублирующая кнопка в WhatsApp ---- */
    if (waBtn) {
      waBtn.addEventListener('click', function () {
        var f = form.elements;
        var parts = ['Здравствуйте! Нужен расчёт.'];
        if (f.name && f.name.value.trim()) parts.push('Имя: ' + f.name.value.trim());
        if (f.material && f.material.value) parts.push('Материал: ' + f.material.value);
        if (f.thickness && f.thickness.value) parts.push('Толщина: ' + f.thickness.value + ' мм');
        if (f.qty && f.qty.value) parts.push('Количество: ' + f.qty.value);
        if (f.comment && f.comment.value.trim()) parts.push('Задача: ' + f.comment.value.trim());
        if (files.length) {
          parts.push('Файлы (' + files.length + '): ' + files.map(function (x) { return x.name; }).join(', ') + ' — прикреплю здесь.');
        } else {
          parts.push('Чертёж/фото прикреплю в чате.');
        }
        waBtn.href = 'https://wa.me/' + CFG.waNumber + '?text=' + encodeURIComponent(parts.join('\n'));
      });
    }

    /* ---- заполнение полей из шкалы толщин и палитры RAL ---- */
    doc.addEventListener('kz:prefill', function (e) {
      var f = form.elements;
      if (e.detail.thickness && f.thickness) {
        f.thickness.value = e.detail.thickness;
        f.thickness.dispatchEvent(new Event('change'));
      }
      if (e.detail.comment && f.comment) {
        var current = f.comment.value.trim();
        f.comment.value = current ? current + '\n' + e.detail.comment : e.detail.comment;
      }
      form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      if (f.name) f.name.focus({ preventScroll: true });
    });
  })();

  /* ======================================================================
     6. Шкала толщин → подставляет значение в форму
     ====================================================================== */
  (function gauge() {
    $$('[data-thickness]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        doc.dispatchEvent(new CustomEvent('kz:prefill', {
          detail: { thickness: btn.dataset.thickness }
        }));
      });
    });
  })();

  /* ======================================================================
     7. RAL-палитра
     ====================================================================== */
  (function ral() {
    var grid = $('#ral-grid');
    if (!grid) return;

    var out = $('#ral-out');
    var code = $('#ral-code');
    var send = $('#ral-send');
    var chosen = null;

    grid.addEventListener('click', function (e) {
      var chip = e.target.closest('.ral__chip');
      if (!chip) return;

      $$('.ral__chip', grid).forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      chip.setAttribute('aria-pressed', 'true');
      chosen = chip.dataset.ral + ' — ' + chip.dataset.name;

      if (code) code.textContent = chosen;
      if (out) out.hidden = false;
    });

    if (send) {
      send.addEventListener('click', function (e) {
        if (!chosen) return;
        var form = $('#quote-form');
        if (form) {
          e.preventDefault();
          doc.dispatchEvent(new CustomEvent('kz:prefill', {
            detail: { comment: 'Порошковая окраска, цвет ' + chosen }
          }));
        }
      });
    }
  })();

  /* ======================================================================
     8. Галерея: фильтры + лайтбокс
     ====================================================================== */
  (function gallery() {
    var grid = $('#gallery');
    if (!grid) return;

    var works = $$('.work', grid);
    var filters = $$('[data-filter]');
    var empty = $('#gallery-empty');

    /* --- фильтры --- */
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.filter;

        filters.forEach(function (b) {
          b.setAttribute('aria-pressed', String(b === btn));
        });

        var shown = 0;
        works.forEach(function (w) {
          var match = key === 'all' || w.dataset.cat === key;
          w.hidden = !match;
          if (match) shown++;
        });

        if (empty) empty.hidden = shown > 0;
        grid.setAttribute('aria-busy', 'false');
      });
    });

    /* --- лайтбокс --- */
    var box = $('#lightbox');
    if (!box) return;

    var stage = $('#lightbox-img');
    var title = $('#lightbox-title');
    var tag = $('#lightbox-tag');
    var counter = $('#lightbox-count');
    var lastFocus = null;
    var visible = [];
    var index = 0;

    function refresh() {
      visible = works.filter(function (w) { return !w.hidden; });
    }

    function paint() {
      var node = visible[index];
      if (!node) return;
      var img = node.querySelector('img');
      stage.src = img.dataset.full || img.currentSrc || img.src;
      stage.alt = img.alt;
      title.textContent = node.dataset.title || '';
      tag.textContent = node.dataset.catLabel || '';
      counter.textContent = (index + 1) + ' / ' + visible.length;
    }

    function open(node) {
      refresh();
      index = visible.indexOf(node);
      if (index < 0) index = 0;
      lastFocus = doc.activeElement;
      box.dataset.open = 'true';
      box.setAttribute('aria-hidden', 'false');
      doc.body.style.overflow = 'hidden';
      paint();
      $('#lightbox-close').focus();
    }

    function close() {
      box.dataset.open = 'false';
      box.setAttribute('aria-hidden', 'true');
      doc.body.style.overflow = '';
      stage.src = '';
      if (lastFocus) lastFocus.focus();
    }

    function step(delta) {
      if (!visible.length) return;
      index = (index + delta + visible.length) % visible.length;
      paint();
    }

    works.forEach(function (w) {
      w.addEventListener('click', function () { open(w); });
    });

    $('#lightbox-close').addEventListener('click', close);
    $('#lightbox-prev').addEventListener('click', function () { step(-1); });
    $('#lightbox-next').addEventListener('click', function () { step(1); });

    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.classList.contains('lightbox__stage')) close();
    });

    doc.addEventListener('keydown', function (e) {
      if (box.dataset.open !== 'true') return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'Tab') {
        // Ловушка фокуса внутри лайтбокса.
        var focusable = $$('button', box);
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // Свайп по горизонтали на мобильных.
    var startX = null;
    box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 55) step(dx < 0 ? 1 : -1);
      startX = null;
    }, { passive: true });
  })();

  /* ======================================================================
     9. Год в подвале
     ====================================================================== */
  $$('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

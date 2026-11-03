// Alessio's Pizza and More – Menü & Anfrageformular
(function () {
  var panel = document.getElementById('menue');
  var backdrop = document.querySelector('.nav-backdrop');
  var opener = document.querySelector('.header-actions .burger');
  if (panel && opener) {
    var setOpen = function (open) {
      panel.classList.toggle('open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      opener.setAttribute('aria-expanded', open ? 'true' : 'false');
      backdrop.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) { var first = panel.querySelector('a, button'); if (first) first.focus(); } else { opener.focus(); }
    };
    opener.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    panel.querySelector('[data-close]').addEventListener('click', function () { setOpen(false); });
    panel.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (a.getAttribute('href').charAt(0) === '#') setOpen(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false); });
    var toggle = panel.querySelector('.nav-drop-toggle');
    var sub = document.getElementById('angebot-menue');
    toggle.addEventListener('click', function () {
      var exp = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', exp ? 'false' : 'true');
      sub.hidden = exp;
    });
  }

  document.querySelectorAll('[data-jahr]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Formular: kein Server nötig – öffnet das E-Mail-Programm mit vorausgefüllter Anfrage
  var form = document.getElementById('anfrage-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      if (!v('f-name') || !form.querySelector('#f-mail').checkValidity() || !v('f-mail')) { status.style.color = '#c3361f'; status.textContent = 'Bitte Name und eine gültige E-Mail-Adresse angeben.'; return; }
      if (!document.getElementById('f-ds').checked) { status.style.color = '#c3361f'; status.textContent = 'Bitte bestätigen Sie den Hinweis zum Datenschutz.'; return; }
      var leistungen = Array.prototype.map.call(form.querySelectorAll('input[name="leistung"]:checked'), function (c) { return c.value; }).join(', ');
      var body = [
        'Name: ' + v('f-name'), 'E-Mail: ' + v('f-mail'), 'Telefon: ' + v('f-tel'),
        'Datum: ' + v('f-datum'), 'Ort: ' + v('f-ort'), 'Gäste: ' + v('f-gaeste'),
        'Gewünscht: ' + leistungen, '', v('f-text')
      ].join('\n');
      var subject = 'Catering-Anfrage' + (v('f-datum') ? ' für den ' + v('f-datum') : '');
      window.location.href = 'mailto:alessiospizza@singing-pizza.de?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.style.color = '';
      status.textContent = 'Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage. Bitte dort noch auf „Senden“ tippen.';
    });
  }
})();

// Videos: bei "Bewegung reduzieren" anhalten, außerhalb des Sichtfelds pausieren
(function () {
  var vids = document.querySelectorAll('video[autoplay]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  vids.forEach(function (v) {
    v.muted = true;
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); } });
      }, { threshold: 0.1 }).observe(v);
    }
  });
})();

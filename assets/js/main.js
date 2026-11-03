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

  var WHATSAPP_NUMMER = '491627110088'; // WhatsApp-Nummer für Anfragen

  // Formular: kein Server nötig – öffnet das E-Mail-Programm mit vorausgefüllter Anfrage
  var LANG = (document.documentElement.lang || 'de').slice(0, 2);
  var ALL = {
    de: { err1: 'Bitte Name und eine gültige E-Mail-Adresse angeben.', err2: 'Bitte bestätigen Sie den Hinweis zum Datenschutz.', name: 'Name', mail: 'E-Mail', tel: 'Telefon', datum: 'Datum', ort: 'Ort', gaeste: 'Gäste', angebot: 'Angebot', subj: 'Catering-Anfrage', fuer: ' für den ', hallo: 'Ciao Alessio, ich interessiere mich für ', euer: 'euer Angebot', wa: 'WhatsApp öffnet sich mit Ihrer fertigen Nachricht. Bitte dort noch auf „Senden“ tippen.', em: 'Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage. Bitte dort noch auf „Senden“ tippen.' },
    en: { err1: 'Please enter your name and a valid e-mail address.', err2: 'Please confirm the privacy notice.', name: 'Name', mail: 'E-mail', tel: 'Phone', datum: 'Date', ort: 'Location', gaeste: 'Guests', angebot: 'Service', subj: 'Catering enquiry', fuer: ' for ', hallo: 'Ciao Alessio, I am interested in ', euer: 'your services', wa: 'WhatsApp opens with your finished message. Just tap “Send” there.', em: 'Your e-mail app opens with the finished enquiry. Just click “Send” there.' },
    it: { err1: 'Inserisci il nome e un indirizzo e-mail valido.', err2: 'Conferma l’informativa sulla privacy.', name: 'Nome', mail: 'E-mail', tel: 'Telefono', datum: 'Data', ort: 'Luogo', gaeste: 'Ospiti', angebot: 'Offerta', subj: 'Richiesta catering', fuer: ' per il ', hallo: 'Ciao Alessio, mi interessa ', euer: 'la vostra offerta', wa: 'Si apre WhatsApp con il messaggio pronto. Tocca ancora “Invia”.', em: 'Si apre il tuo programma e-mail con la richiesta pronta. Clicca ancora “Invia”.' }
  };
  var TXT = ALL[LANG] || ALL.de;
  var form = document.getElementById('anfrage-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = document.getElementById('form-status');
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      if (!v('f-name') || !form.querySelector('#f-mail').checkValidity() || !v('f-mail')) { status.style.color = '#c3361f'; status.textContent = TXT.err1; return; }
      if (!document.getElementById('f-ds').checked) { status.style.color = '#c3361f'; status.textContent = TXT.err2; return; }
      var leistungen = Array.prototype.map.call(form.querySelectorAll('input[name="leistung"]:checked'), function (c) { return c.value; }).join(', ');
      var body = [
        TXT.name + ': ' + v('f-name'), TXT.mail + ': ' + v('f-mail'), TXT.tel + ': ' + v('f-tel'),
        TXT.datum + ': ' + v('f-datum'), TXT.ort + ': ' + v('f-ort'), TXT.gaeste + ': ' + v('f-gaeste'),
        TXT.angebot + ': ' + leistungen, '', v('f-text')
      ].join('\n');
      var subject = TXT.subj + (v('f-datum') ? TXT.fuer + v('f-datum') : '');
      var kanal = (e.submitter && e.submitter.getAttribute('data-kanal')) || 'email';
      status.style.color = '';
      if (kanal === 'whatsapp') {
        var text = TXT.hallo + (leistungen || TXT.euer) + '.\n\n' + body;
        var waUrl = 'https://wa.me/' + WHATSAPP_NUMMER + '?text=' + encodeURIComponent(text);
        var w = window.open(waUrl, '_blank');
        if (w) { try { w.opener = null; } catch (err) {} } else { window.location.href = waUrl; } // Popup blockiert: direkt öffnen
        status.textContent = TXT.wa;
      } else {
        window.location.href = 'mailto:alessiospizza@singing-pizza.de?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
        status.textContent = TXT.em;
      }
    });
  }
})();

// Videos: bei "Bewegung reduzieren" anhalten, außerhalb des Sichtfelds pausieren
(function () {
  var vids = document.querySelectorAll('video[autoplay]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (navigator.connection && navigator.connection.saveData) reduce = true; // Datensparmodus: nur Standbild
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

// Sanftes Einblenden beim Scrollen
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sel = '.section-head, .napo-card, .napo-bilder figure, .napoli-inner > *, .leistung, .karte-grid > *, .zitat, .about-grid > *, .gemeinsam, .ablauf-grid li, .rundum, .abend-schritt, .galerie-grid > *, .faq-item, .kontakt-grid > *';
  var els = document.querySelectorAll(sel);
  if (!els.length) return;
  document.documentElement.classList.add('js-reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('sichtbar'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(function (el) {
    var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(sel); }) : [];
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i % 4, 3) * 0.12 + 's');
    el.classList.add('reveal');
    io.observe(el);
  });
})();

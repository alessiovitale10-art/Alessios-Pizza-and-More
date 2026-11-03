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
    de: { err1: TXT.err1, err2: TXT.err2, name: 'Name', mail: 'E-Mail', tel: 'Telefon', datum: 'Datum', ort: 'Ort', gaeste: 'Gäste', angebot: 'Angebot', subj: TXT.subj, fuer: TXT.fuer, hallo: TXT.hallo, euer: TXT.euer, wa: TXT.wa, em: TXT.em },
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
        window.open('https://wa.me/' + WHATSAPP_NUMMER + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
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

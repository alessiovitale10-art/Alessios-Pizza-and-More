#!/usr/bin/env python3
"""Erzeugt en/index.html und it/index.html aus der deutschen index.html."""
import html, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from i18n import T, META
from adresse import SITE_URL as BASE

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import json, datetime

def faq_ld(page):
    # FAQPage-Daten für Google aus den sichtbaren FAQ-Einträgen erzeugen
    qa = re.findall(r'<summary>(.*?)</summary>\s*<p>(.*?)</p>', page, re.S)
    data = {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': html.unescape(q), 'acceptedAnswer': {'@type': 'Answer', 'text': html.unescape(re.sub('<[^>]+>', '', a))}} for q, a in qa]}
    block = '<!--faq-ld--><script type="application/ld+json">' + json.dumps(data, ensure_ascii=False) + '</script><!--/faq-ld-->'
    page = re.sub(r'<!--faq-ld-->.*?<!--/faq-ld-->\n?', '', page, flags=re.S)
    return page.replace('</head>', block + '\n</head>', 1)

def firma_ld(page, lang):
    # Firmendaten für Google: Beschreibung und Adresse in der Sprache der Seite
    def neu(m):
        data = json.loads(m.group(2))
        data['description'] = META[lang]
        data['url'] = BASE + lang + '/'
        return m.group(1) + json.dumps(data, ensure_ascii=False, indent=1) + m.group(3)
    return re.sub(r'(<script type="application/ld\+json">\n)(\{.*?\})(\n</script>)', neu, page, count=1, flags=re.S)

de_path = os.path.join(ROOT, 'index.html')
src = open(de_path, encoding='utf-8').read()
# Adresse der Website aus tools/adresse.py überall einsetzen (z. B. nach Umzug auf eigene Domain)
alt = re.search(r'<link rel="canonical" href="([^"]+)">', src).group(1)
if alt != BASE:
    src = src.replace(alt, BASE)
src = faq_ld(src)
open(de_path, 'w', encoding='utf-8').write(src)

# sitemap.xml und robots.txt
heute = datetime.date.today().isoformat()
urls = {'de': BASE, 'en': BASE + 'en/', 'it': BASE + 'it/'}
alts = ''.join('    <xhtml:link rel="alternate" hreflang="%s" href="%s"/>\n' % (l, u) for l, u in list(urls.items()) + [('x-default', BASE)])
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
sm += ''.join('  <url>\n    <loc>%s</loc>\n    <lastmod>%s</lastmod>\n%s  </url>\n' % (u, heute, alts) for u in urls.values()) + '</urlset>\n'
open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write(sm)
open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf-8').write('User-agent: *\nAllow: /\n\nSitemap: %ssitemap.xml\n' % BASE)
LANGS = {'en': 0, 'it': 1}
ATTRS = ('alt', 'aria-label', 'placeholder', 'title', 'value', 'content')

def tr(text, i, used):
    key = html.unescape(text)
    if key in T:
        used.add(key)
        return html.escape(T[key][i], quote=True) if '"' in T[key][i] else T[key][i].replace('&', '&amp;').replace('<', '&lt;')
    return None

def fix_url(u):
    if re.match(r'^(#|https?:|mailto:|tel:|data:|/|\.\./)', u):
        return u
    return '../' + u

for lang, i in LANGS.items():
    used = set()
    s = src
    # Textknoten
    def text_node(m):
        raw = m.group(1)
        core = raw.strip()
        if not core:
            return m.group(0)
        t = tr(core, i, used)
        if t is None:
            return m.group(0)
        lead = raw[:len(raw) - len(raw.lstrip())]
        trail = raw[len(raw.rstrip()):]
        return '>' + lead + t + trail + '<'
    head, body = s.split('<body', 1)
    # <title> und Meta-Beschreibung im Kopf
    head = re.sub(r'>([^<>]+)<', text_node, head)
    head = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + META[lang] + m.group(2), head)
    body = re.sub(r'>([^<>]+)<', text_node, body)
    s = head + '<body' + body
    # Attribute
    def attr(m):
        t = tr(m.group(2), i, used)
        return m.group(0) if t is None else '%s="%s"' % (m.group(1), t)
    s = re.sub(r'\b(%s)="([^"]*)"' % '|'.join(ATTRS), attr, s)
    # Pfade
    s = re.sub(r'\b(href|src|poster)="([^"]*)"', lambda m: '%s="%s"' % (m.group(1), fix_url(m.group(2))), s)
    s = re.sub(r'\b(srcset|imagesrcset)="([^"]*)"', lambda m: '%s="%s"' % (m.group(1), ', '.join(fix_url(u.strip()) for u in m.group(2).split(','))), s)
    s = s.replace('<html lang="de"', '<html lang="%s"' % lang)
    # Sprachumschalter
    def nav(m):
        cls = m.group(1)
        links = {'de': '../', 'en': '../en/', 'it': '../it/'}
        out = ''.join('<a href="%s" hreflang="%s" lang="%s"%s>%s</a>' % (links[l], l, l, ' aria-current="true"' if l == lang else '', l.upper()) for l in ('de', 'en', 'it'))
        return '<nav class="%s" aria-label="%s">%s</nav>' % (cls, T['Sprache'][i], out)
    s = re.sub(r'<nav class="(sprachen[^"]*)" aria-label="[^"]*">.*?</nav>', nav, s, flags=re.S)
    s = s.replace('l’ <a', 'l’<a')
    s = s.replace('<link rel="canonical" href="%s">' % BASE, '<link rel="canonical" href="%s%s/">' % (BASE, lang))
    s = s.replace('<meta property="og:url" content="%s">' % BASE, '<meta property="og:url" content="%s%s/">' % (BASE, lang))
    s = s.replace('content="de_DE"', 'content="%s"' % {'en': 'en_GB', 'it': 'it_IT'}[lang])
    s = s.replace('assets/img/vorschau.jpg"', 'assets/img/vorschau-%s.jpg"' % lang)
    s = faq_ld(firma_ld(s, lang))
    os.makedirs(os.path.join(ROOT, lang), exist_ok=True)
    open(os.path.join(ROOT, lang, 'index.html'), 'w', encoding='utf-8').write(s)
    missing = sorted(set(T) - used)
    print(lang, 'ok; ungenutzt:', missing)

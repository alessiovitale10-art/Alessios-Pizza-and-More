#!/usr/bin/env python3
"""Erzeugt aus den JPEGs in assets/media verkleinerte WebP-Varianten
(z. B. teig-640.webp), damit Handys nur so große Bilder laden wie nötig.
Aufruf: python3 tools/bilder.py   (benötigt Pillow)"""
import os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, 'assets', 'media')
BREITEN = (400, 640, 800, 1200, 1600, 2000)
# Nur Bilder, die auf der Seite verwendet werden
BILDER = ('pizza-hero', 'teig', 'belegen', 'forza-napoli', 'team-station', 'kaffee-ape', 'sektempfang',
          'pizzadoc', 'zelt', 'abendstation', 'station-wiese', 'alessio', 'hochzeit')

def breiten(w):
    """Stufen unterhalb der Originalbreite, plus das Original selbst."""
    out = [b for b in BREITEN if b < w * 0.9]
    return out + [w]

if __name__ == '__main__':
    for name in BILDER:
        im = Image.open(os.path.join(MEDIA, name + '.jpg')).convert('RGB')
        for b in breiten(im.width):
            ziel = os.path.join(MEDIA, '%s-%d.webp' % (name, b))
            klein = im if b == im.width else im.resize((b, round(im.height * b / im.width)), Image.LANCZOS)
            # große Stufen landen nur auf sehr scharfen Displays, dort reicht etwas mehr Kompression
            klein.save(ziel, 'WEBP', quality=80 if b <= 800 else 70, method=6)
            print(os.path.relpath(ziel, ROOT), os.path.getsize(ziel) // 1024, 'KB')
    # Logo für die Kopfzeile (64 px, für scharfe Displays bis 3x)
    logo = Image.open(os.path.join(ROOT, 'assets', 'img', 'logo-hell.png')).convert('RGBA')
    for b in (64, 128, 192):
        ziel = os.path.join(ROOT, 'assets', 'img', 'logo-hell-%d.webp' % b)
        logo.resize((b, b), Image.LANCZOS).save(ziel, 'WEBP', quality=90, method=6)
        print(os.path.relpath(ziel, ROOT), os.path.getsize(ziel) // 1024, 'KB')

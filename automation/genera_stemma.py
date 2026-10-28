# GUIDA-SVILUPPO: genera il logo "C" (C oro grande su quadrato blu arrotondato), pensato per icone piccole (tratto spesso, nessun dettaglio).
# Uso, dalla radice del sito:  python automation/genera_stemma.py
# Scrive in assets/images: favicon.svg, favicon-16/32/48/96/192/512.png, apple-touch-icon.png, favicon.ico e favicon.ico nella radice.
import math, os
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'images')
GOLD, NAVY = (212, 175, 55, 255), (20, 40, 75, 255)
CX = CY = 256; R = 138; W = 104; A = 42; RAD = 112
a1, a2 = math.radians(A), math.radians(-A)
p1 = (CX + R * math.cos(a1), CY + R * math.sin(a1)); p2 = (CX + R * math.cos(a2), CY + R * math.sin(a2))
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="%d" fill="#14284b"/>'
  '<path d="M%.1f %.1f A%d %d 0 1 1 %.1f %.1f" fill="none" stroke="#d4af37" stroke-width="%d" stroke-linecap="round"/></svg>\n'
  % (RAD, p1[0], p1[1], R, R, p2[0], p2[1], W))
open(os.path.join(IMG, 'favicon.svg'), 'w', encoding='utf-8', newline='\n').write(svg)
def render(N, pad=0.0):
    S = 8; M = N * S; sc = M * (1 - pad) / 512; o = M * pad / 2
    T = lambda p: (p[0] * sc + o, p[1] * sc + o)
    im = Image.new('RGBA', (M, M), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((o, o, o + 512 * sc, o + 512 * sc), radius=RAD * sc, fill=NAVY)
    cx, cy = T((CX, CY)); ro = (R + W / 2) * sc
    d.arc((cx - ro, cy - ro, cx + ro, cy + ro), A, 360 - A, fill=GOLD, width=int(W * sc))
    for p in (p1, p2):
        x, y = T(p); e = W * sc / 2; d.ellipse((x - e, y - e, x + e, y + e), fill=GOLD)
    return im.resize((N, N), Image.LANCZOS)
for n in (16, 32, 48, 96, 192, 512): render(n).save(os.path.join(IMG, 'favicon-%d.png' % n))
ap = Image.new('RGB', (180, 180), (255, 255, 255)); r = render(180, 0.12); ap.paste(r, (0, 0), r); ap.save(os.path.join(IMG, 'apple-touch-icon.png'))
ico = render(256); ico.save(os.path.join(IMG, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
ico.save(os.path.join(ROOT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print('logo C scritto')

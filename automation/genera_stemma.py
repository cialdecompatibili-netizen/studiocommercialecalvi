# GUIDA-SVILUPPO: genera il logo scudetto blu/oro con una C grande dentro, ottimizzato per icone piccole (tratto spesso, niente dettagli).
# Uso, dalla radice del sito:  python automation/genera_stemma.py
# Legge i poligoni dello scudo da assets/images/favicon.svg (primi due) e riscrive favicon.svg, favicon-16/32/48/96/192/512.png, apple-touch-icon.png, favicon.ico (anche nella radice).
import math, os, re
from PIL import Image, ImageDraw
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'images')
GOLD, NAVY = (212, 175, 55, 255), (20, 40, 75, 255)
old = open(os.path.join(IMG, 'favicon.svg'), encoding='utf-8').read()
polys = re.findall(r'<polygon points="([^"]+)"', old)
def pts(s): return [tuple(map(float, p.split(','))) for p in s.split()]
OUT, IN = pts(polys[0]), pts(polys[1])
CX, CY, R, W, A = 256, 250, 100, 76, 42
a1, a2 = math.radians(A), math.radians(-A)
p1 = (CX + R * math.cos(a1), CY + R * math.sin(a1)); p2 = (CX + R * math.cos(a2), CY + R * math.sin(a2))
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 30 432 460"><polygon points="%s" fill="#d4af37"/><polygon points="%s" fill="#14284b"/>'
  '<path d="M%.1f %.1f A%d %d 0 1 1 %.1f %.1f" fill="none" stroke="#d4af37" stroke-width="%d" stroke-linecap="round"/></svg>\n'
  % (polys[0], polys[1], p1[0], p1[1], R, R, p2[0], p2[1], W))
open(os.path.join(IMG, 'favicon.svg'), 'w', encoding='utf-8', newline='\n').write(svg)
def render(N, pad=0.0):
    S = 8; M = N * S; sc = M * (1 - pad) / 460
    ox = (M - 432 * sc) / 2 - 40 * sc; oy = (M - 460 * sc) / 2 - 30 * sc
    T = lambda p: (p[0] * sc + ox, p[1] * sc + oy)
    im = Image.new('RGBA', (M, M), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.polygon([T(p) for p in OUT], fill=GOLD); d.polygon([T(p) for p in IN], fill=NAVY)
    cx, cy = T((CX, CY)); ro = (R + W / 2) * sc
    d.arc((cx - ro, cy - ro, cx + ro, cy + ro), A, 360 - A, fill=GOLD, width=int(W * sc))
    for p in (p1, p2):
        x, y = T(p); e = W * sc / 2; d.ellipse((x - e, y - e, x + e, y + e), fill=GOLD)
    return im.resize((N, N), Image.LANCZOS)
for n in (16, 32, 48, 96, 192, 512): render(n).save(os.path.join(IMG, 'favicon-%d.png' % n))
ap = Image.new('RGB', (180, 180), (255, 255, 255)); r = render(180, 0.12); ap.paste(r, (0, 0), r); ap.save(os.path.join(IMG, 'apple-touch-icon.png'))
ico = render(256); ico.save(os.path.join(IMG, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
ico.save(os.path.join(ROOT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print('scudetto con C scritto')

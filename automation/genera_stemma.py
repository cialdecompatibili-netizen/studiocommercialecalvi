# GUIDA-SVILUPPO: genera il logo scudetto blu/oro con una C calligrafica (corsiva con ricci) dentro.
# Uso, dalla radice del sito:  python automation/genera_stemma.py [NomeFont.ttf] [anteprima]
# Font in automation/fonts (default PinyonScript-Regular.ttf, alternativa GreatVibes-Regular.ttf). Legge i poligoni dello scudo da assets/images/favicon.svg.
# Scrive favicon.svg, favicon-16/32/48/96/192/512.png, apple-touch-icon.png, favicon.ico (anche nella radice). Con "anteprima" scrive solo automation/anteprima.png.
import os, re, sys
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'assets', 'images')
FONT = os.path.join(ROOT, 'automation', 'fonts', sys.argv[1] if len(sys.argv) > 1 else 'PinyonScript-Regular.ttf')
GOLD, NAVY = (212, 175, 55, 255), (20, 40, 75, 255)
CX, CY, H, STK = 256, 252, 330, 14
old = open(os.path.join(IMG, 'favicon.svg'), encoding='utf-8').read()
polys = re.findall(r'<polygon points="([^"]+)"', old)
def pts(s): return [tuple(map(float, p.split(','))) for p in s.split()]
OUT, IN = pts(polys[0]), pts(polys[1])
tt = TTFont(FONT); gs = tt.getGlyphSet(); gname = tt.getBestCmap()[ord('C')]
bp = BoundsPen(gs); gs[gname].draw(bp); x0, y0, x1, y1 = bp.bounds
s = H / (y1 - y0)
sp = SVGPathPen(gs, ntos=lambda v: '%.1f' % v)
gs[gname].draw(TransformPen(sp, (s, 0, 0, -s, CX - s * (x0 + x1) / 2, CY + s * (y0 + y1) / 2)))
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 30 432 460" preserveAspectRatio="none"><polygon points="%s" fill="#d4af37"/><polygon points="%s" fill="#14284b"/>'
  '<path d="%s" fill="#d4af37" stroke="#d4af37" stroke-width="%d" stroke-linejoin="round"/></svg>\n' % (polys[0], polys[1], sp.getCommands(), STK))
def render(N, pad=0.0):
    # Scudo a TUTTA l'area (nessun margine): disegno 432x460 e poi stiro a quadrato NxN (stesso effetto di preserveAspectRatio="none" nell'svg).
    k = 8 * N / 460; W, Hh = int(432 * k), int(460 * k)
    T = lambda p: ((p[0] - 40) * k, (p[1] - 30) * k)
    im = Image.new('RGBA', (W, Hh), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.polygon([T(p) for p in OUT], fill=GOLD); d.polygon([T(p) for p in IN], fill=NAVY)
    f0 = ImageFont.truetype(FONT, 1000); l, t, r, b = f0.getbbox('C')
    f = ImageFont.truetype(FONT, int(1000 * H * k / (b - t))); l, t, r, b = f.getbbox('C')
    cx, cy = T((CX, CY)); d.text((cx - (l + r) / 2, cy - (t + b) / 2), 'C', font=f, fill=GOLD, stroke_width=max(1, int(STK * k / 2)), stroke_fill=GOLD)
    return im.resize((N, N), Image.LANCZOS)
if len(sys.argv) > 2:
    bg = Image.new('RGB', (1000, 540), (255, 255, 255)); big = render(512); bg.paste(big, (10, 10), big)
    for i, n in enumerate((96, 48, 32, 16)):
        sm = render(n); bg.paste(sm, (560 + i * 110, 30), sm)
    bg.save(os.path.join(ROOT, 'automation', 'anteprima.png')); print('anteprima scritta'); sys.exit()
open(os.path.join(IMG, 'favicon.svg'), 'w', encoding='utf-8', newline='\n').write(svg)
for n in (16, 32, 48, 96, 192, 512): render(n).save(os.path.join(IMG, 'favicon-%d.png' % n))
ap = Image.new('RGB', (180, 180), (255, 255, 255)); r = render(180); ap.paste(r, (0, 0), r); ap.save(os.path.join(IMG, 'apple-touch-icon.png'))
ico = render(256); ico.save(os.path.join(IMG, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
ico.save(os.path.join(ROOT, 'favicon.ico'), sizes=[(16, 16), (32, 32), (48, 48)])
print('scudetto con C calligrafica scritto')

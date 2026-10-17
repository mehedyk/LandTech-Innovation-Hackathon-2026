"""Regenerate README screenshots and the demo GIF from the running app.
Optional tool. Needs: pip install playwright pillow && playwright install chromium
Usage: npm run build && npx vite preview --port 4176 &   then   python3 scripts/make-media.py
"""
import io, os
from PIL import Image
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'http://localhost:4176/')
OUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'media')
os.makedirs(OUT, exist_ok=True)

def shot(pg, name, full=False):
    pg.wait_for_timeout(350)
    pg.screenshot(path=f'{OUT}/{name}.png', full_page=full)

def frame(pg):
    pg.wait_for_timeout(400)
    return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1200, 'height': 760}, device_scale_factor=1)

    # --- demo GIF: walk through the examples ---
    pg.goto(BASE + '#/check'); pg.wait_for_timeout(500)
    frames = []
    for label in ['Clean sale', 'Sold twice', 'Selling more than owned', 'Government land', 'Forged QR']:
        pg.get_by_role('button', name=label, exact=True).click()
        frames.append(frame(pg))
    pg.goto(BASE + '#/alerts'); frames.append(frame(pg))
    pg.goto(BASE + '#/cases/L05'); frames.append(frame(pg))
    pg.goto(BASE + '#/benchmark'); frames.append(frame(pg))
    small = [f.resize((960, int(960 * f.height / f.width)), Image.LANCZOS).quantize(colors=96, method=Image.MEDIANCUT) for f in frames]
    small[0].save(f'{OUT}/demo.gif', save_all=True, append_images=small[1:], duration=2200, loop=0, optimize=True, disposal=2)

    # --- screenshots ---
    pg.goto(BASE + '#/check'); pg.wait_for_timeout(400)
    pg.get_by_role('button', name='Sold twice', exact=True).click(); shot(pg, 'check')
    pg.goto(BASE + '#/alerts'); shot(pg, 'alerts')
    pg.goto(BASE + '#/cases/L05'); shot(pg, 'parcel')
    pg.goto(BASE + '#/benchmark'); shot(pg, 'benchmark')
    pg.goto(BASE + '#/how'); shot(pg, 'how')
    pg.goto(BASE + '#/about'); shot(pg, 'roadmap')

    m = b.new_page(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    m.goto(BASE + '#/check'); m.wait_for_timeout(400)
    m.get_by_role('button', name='Sold twice', exact=True).click(); m.wait_for_timeout(400)
    m.screenshot(path=f'{OUT}/mobile.png')
    b.close()
print('media written to docs/media')

"""Regenerate README screenshots and the demo GIF from the running app (Bangla is the default language).
Signs in as the demo admin/auditor (who can open every page), so the session is pre-set; also writes dashboard and login. Writes map, nid, split (admin-only side-by-side view), (also public/deck/img/check*.png for the deck): check, audit (full page), check-dark, check-en, buy, alerts, parcel, benchmark, how, roadmap, report (the downloaded HTML report), mobile, mobile-dark, demo.gif.
Optional tool. Needs: pip install playwright pillow && playwright install chromium
Bangla text needs a Bengali font on the machine (for example fonts-noto-core on Linux).
Usage: npm run build && npx vite preview --port 4176 &   then   python3 scripts/make-media.py
"""
import io, os
from PIL import Image
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'http://localhost:4176/')
CHROMIUM = os.environ.get('CHROMIUM')  # optional path to a Chromium binary
OUT = os.path.join(os.path.dirname(__file__), '..', 'docs', 'media')
os.makedirs(OUT, exist_ok=True)
EX = {'clean': 'সঠিক বিক্রি', 'twice': 'একই জমি দুইবার বিক্রি', 'overrun': 'মালিকানার চেয়ে বেশি বিক্রি',
      'khas': 'সরকারি (খাস) জমি', 'forged': 'জাল QR কোড'}

# The app now needs a sign-in. The admin/auditor demo account can open every page, so all captures use it.
SESSION = "try{localStorage.setItem('ardh.session.v2','auditor@ardh.demo')}catch(e){}"

def new_page(b, signed_in=True, **kw):
    c = b.new_context(**kw)
    if signed_in:
        c.add_init_script(SESSION)
    return c.new_page()

def shot(pg, name, full=False):
    pg.evaluate('window.scrollTo(0, 0)')
    pg.wait_for_timeout(350)
    pg.screenshot(path=f'{OUT}/{name}.png', full_page=full)

def frame(pg):
    pg.wait_for_timeout(400)
    return Image.open(io.BytesIO(pg.screenshot())).convert('RGB')

def click(pg, key):
    pg.get_by_role('button', name=EX[key], exact=True).click()

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROMIUM) if CHROMIUM else p.chromium.launch()
    pg = new_page(b, viewport={'width': 1280, 'height': 900}, device_scale_factor=1)

    # --- demo GIF: officer examples, then the citizen page, alerts, parcel, benchmark ---
    pg.goto(BASE + '#/check'); pg.wait_for_timeout(500)
    frames = []
    for key in ['clean', 'twice', 'overrun', 'khas', 'forged']:
        click(pg, key); frames.append(frame(pg))
    pg.goto(BASE + '#/buy'); pg.wait_for_timeout(300); click(pg, 'twice'); frames.append(frame(pg))
    pg.goto(BASE + '#/alerts'); frames.append(frame(pg))
    pg.goto(BASE + '#/cases/L05'); frames.append(frame(pg))
    pg.goto(BASE + '#/benchmark'); frames.append(frame(pg))
    small = [f.resize((960, int(960 * f.height / f.width)), Image.LANCZOS).quantize(colors=96, method=Image.MEDIANCUT) for f in frames]
    small[0].save(f'{OUT}/demo.gif', save_all=True, append_images=small[1:], duration=2200, loop=0, optimize=True, disposal=2)

    # --- screenshots (Bangla) ---
    pg.goto(BASE + '#/check'); pg.wait_for_timeout(400); click(pg, 'twice'); shot(pg, 'check'); shot(pg, 'audit', full=True)
    # parcel map, the locked NID box, and the side-by-side screen
    pg.add_style_tag(content='header{position:static !important}')  # keep the sticky header out of element shots
    pg.locator('.ag-map').screenshot(path=f'{OUT}/map.png')
    pg.locator('.ag-nid summary').click(); pg.wait_for_timeout(200)
    pg.locator('.ag-nid').locator('xpath=..').screenshot(path=f'{OUT}/nid.png')
    sp = new_page(b, viewport={'width': 1440, 'height': 1500}, device_scale_factor=1)
    sp.goto(BASE + '#/split'); sp.wait_for_timeout(500)
    sp.locator('.ag-pane[data-aud=officer]').get_by_role('button', name=EX['twice'], exact=True).click()
    sp.locator('.ag-pane[data-aud=citizen]').get_by_role('button', name=EX['twice'], exact=True).click(); sp.wait_for_timeout(500)
    sp.evaluate('window.scrollTo(0, 0)'); sp.screenshot(path=f'{OUT}/split.png'); sp.close()
    # the report an officer downloads, rendered
    with pg.expect_download() as dl:
        pg.get_by_role('button', name='প্রতিবেদন ডাউনলোড (HTML)').first.click()
    html = open(dl.value.path(), encoding='utf-8').read()
    rp = new_page(b, viewport={'width': 900, 'height': 1000}, device_scale_factor=1)
    rp.set_content(html); rp.wait_for_timeout(300); rp.screenshot(path=f'{OUT}/report.png', full_page=True); rp.close()
    # dark theme
    pg.evaluate("localStorage.setItem('ardh.theme','dark')"); pg.reload(); pg.wait_for_timeout(400); click(pg, 'overrun'); shot(pg, 'check-dark')
    pg.evaluate("localStorage.setItem('ardh.theme','light')"); pg.reload(); pg.wait_for_timeout(300)
    pg.goto(BASE + '#/buy'); pg.wait_for_timeout(300); click(pg, 'twice'); shot(pg, 'buy')
    pg.goto(BASE + '#/alerts'); shot(pg, 'alerts')
    pg.goto(BASE + '#/cases/L05'); shot(pg, 'parcel')
    pg.goto(BASE + '#/benchmark'); shot(pg, 'benchmark')
    pg.goto(BASE + '#/how'); shot(pg, 'how')
    pg.goto(BASE + '#/about'); shot(pg, 'roadmap')
    # English view of the same screen
    pg.get_by_role('button', name='English', exact=True).click(); pg.goto(BASE + '#/check'); pg.wait_for_timeout(300)
    pg.get_by_role('button', name='Sold twice', exact=True).click(); shot(pg, 'check-en')
    pg.get_by_role('button', name='বাংলা', exact=True).click()

    m = new_page(b, viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    m.goto(BASE + '#/check'); m.wait_for_timeout(400); click(m, 'twice'); m.wait_for_timeout(400)
    m.evaluate("window.scrollTo(0, document.querySelector('.ag-banner').offsetTop - 150)"); m.wait_for_timeout(200)
    m.screenshot(path=f'{OUT}/mobile.png')
    m.evaluate("localStorage.setItem('ardh.theme','dark')"); m.reload(); m.wait_for_timeout(400); click(m, 'twice'); m.wait_for_timeout(300)
    m.evaluate("window.scrollTo(0, document.querySelector('.ag-banner').offsetTop - 150)"); m.wait_for_timeout(200)
    m.screenshot(path=f'{OUT}/mobile-dark.png')
    # deck slide images (1200x760), scrolled so the verdict banner and tiles are in view
    DECK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'deck', 'img')
    dk = new_page(b, viewport={'width': 1280, 'height': 760}, device_scale_factor=1)
    dk.goto(BASE + '#/check'); dk.wait_for_timeout(400); click(dk, 'twice'); dk.wait_for_timeout(300)
    dk.evaluate("window.scrollTo(0, document.querySelector('.ag-banner').offsetTop - 120)"); dk.wait_for_timeout(300)
    dk.screenshot(path=f'{DECK}/check.png')
    dk.get_by_role('button', name='English', exact=True).click(); dk.goto(BASE + '#/check'); dk.wait_for_timeout(300)
    dk.get_by_role('button', name='Sold twice', exact=True).click(); dk.wait_for_timeout(300)
    dk.evaluate("window.scrollTo(0, document.querySelector('.ag-banner').offsetTop - 120)"); dk.wait_for_timeout(300)
    dk.screenshot(path=f'{DECK}/check-en.png')
    # --- v2 shell: the admin dashboard and the sign-in page (no session) ---
    pg.goto(BASE + '#/dashboard'); pg.wait_for_timeout(500); shot(pg, 'dashboard', full=True)
    lg = new_page(b, signed_in=False, viewport={'width': 1280, 'height': 900}, device_scale_factor=1)
    lg.goto(BASE + '#/login'); lg.wait_for_timeout(500); lg.screenshot(path=f'{OUT}/login.png')
    b.close()
print('media written to docs/media')

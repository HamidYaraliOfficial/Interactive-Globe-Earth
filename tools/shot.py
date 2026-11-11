import sys
from playwright.sync_api import sync_playwright
C = sys.argv[1] if len(sys.argv) > 1 else 'Iran'
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width': 1280, 'height': 800}); pg.on('pageerror', lambda e: print('ERR', e))
    pg.goto('file:///home/claude/world-map/index.html'); pg.wait_for_timeout(2500)
    pg.screenshot(path='../docs/screenshot-globe.png')
    pg.fill('#q', C); pg.press('#q', 'Enter'); pg.wait_for_timeout(3500)
    pg.screenshot(path='../docs/screenshot-country.png')
    box = pg.locator('#stage').bounding_box(); pg.mouse.click(box['x'] + box['width'] * .52, box['y'] + box['height'] * .55); pg.wait_for_timeout(400)
    pg.screenshot(path='../docs/screenshot-modal.png')
    pg.keyboard.press('Escape'); pg.click('#bk'); pg.wait_for_timeout(500)
    pg.fill('#q', 'Damavand'); pg.wait_for_timeout(200); pg.screenshot(path='../docs/screenshot-search.png'); pg.press('#q', 'Enter'); pg.wait_for_timeout(4200)
    print('modal open after search:', pg.evaluate("!document.getElementById('modal').hidden"), pg.evaluate("document.querySelector('#mb h2')&&document.querySelector('#mb h2').textContent"), 'hash', pg.evaluate('location.hash'))
    pg.keyboard.press('Escape'); pg.click('#bk'); pg.wait_for_timeout(400); pg.click('#cmp'); pg.fill('#ca', 'Iran'); pg.fill('#cb', 'Japan'); pg.dispatch_event('#ca', 'change'); pg.dispatch_event('#cb', 'change'); pg.wait_for_timeout(300)
    pg.screenshot(path='../docs/screenshot-compare.png'); b.close()

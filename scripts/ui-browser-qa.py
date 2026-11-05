from pathlib import Path
from playwright.sync_api import sync_playwright
import json
root=Path(__file__).resolve().parents[1]
ui=root/'public'
html=(ui/'index.html').read_text().replace('<head>','<head><base href="https://rift.local/" />')
health={'name':'RIFT','version':'0.3.0','mode':'sandbox','providers':{'og':False,'hedera':False,'arkiv':False},'live':{'enabled':False,'configured':False,'missing':['OG_API_KEY','HEDERA_ACCOUNT_ID','ARKIV_ACCESS_KEY']},'liveVerification':{'og':False,'hedera':False,'arkiv':False}}
with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
  for w,h,label in [(1440,900,'desktop'),(390,844,'mobile')]:
    page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1)
    page.emulate_media(reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    def handler(route):
      name=route.request.url.split('rift.local/')[-1].split('?')[0]
      if name=='api/health':return route.fulfill(status=200,content_type='application/json',body=json.dumps(health))
      target=(ui/name).resolve()
      if target.is_file() and target.is_relative_to(ui):
        ctype='text/css' if name.endswith('.css') else 'text/javascript' if name.endswith('.mjs') else 'text/html'
        return route.fulfill(status=200,content_type=ctype,body=target.read_bytes())
      return route.fulfill(status=404,body='Not found')
    page.route('https://fonts.googleapis.com/**',lambda route:route.abort())
    page.route('https://fonts.gstatic.com/**',lambda route:route.abort())
    page.route('https://rift.local/**',handler)
    page.set_content(html,wait_until='domcontentloaded')
    page.wait_for_timeout(600)
    assert page.locator('.arena-brief').count()==1,'hero not loaded'
    bg=page.locator('body').evaluate('(el)=>getComputedStyle(el).backgroundColor')
    assert bg not in ['rgba(0, 0, 0, 0)','rgb(255, 255, 255)'], 'styles failed to load: '+bg
    assert page.locator('.brief-sponsor-line').count()==1,'three-sponsor intro missing'
    if label=='desktop':page.screenshot(path='/mnt/data/rift-world003-desktop.png',full_page=False)
    if w>760:
      page.get_by_role('button',name='Launch Blackout Protocol').first.click(timeout=2000) if page.get_by_role('button',name='Launch Blackout Protocol').count()>0 else page.locator('[data-act="launch"][data-value="blackout"]').first.click(timeout=2000)
    else:
      page.locator('[data-act="launch"][data-value="blackout"]').first.click(timeout=2000)
    assert page.locator('.live-pipeline').count()==1,'sponsor pipeline missing from active mission'
    assert page.locator('[data-act="live-run"]').is_disabled(),'payment should be disabled without keys'
    assert page.locator('.sponsor-node').count()==3,'all sponsor nodes missing'
    page.locator('.cmd-attack').click(timeout=3000)
    assert page.get_by_text('Payment blocked.',exact=True).count()>=1
    overflow=page.evaluate('document.documentElement.scrollWidth > window.innerWidth + 4')
    assert not overflow,'horizontal overflow on '+label
    assert not errors,errors
    print(label,'passed','sponsor pipeline',page.locator('.sponsor-node').count(),'errors',errors)
    page.close()
  browser.close()

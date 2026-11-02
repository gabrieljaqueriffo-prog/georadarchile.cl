"""Read-only comparison of Search Console URLs, Wix, local build and Pages.
Uses bundled pandas for XLSX input and Python standard library for HTTP/HTML.
Not a browser-rendered Wix/schema or visual accessibility audit.
"""
import concurrent.futures, datetime, html.parser, json, pathlib, re, urllib.request, urllib.parse, urllib.error
import pandas as pd

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/migration/priority-audit-2026-10-26'
OUT.mkdir(parents=True, exist_ok=True)
PERF = pathlib.Path('D:/Descargas/georadarchile.cl-Performance-on-Search-2026-10-24.xlsx')
LINKS = pathlib.Path('D:/Descargas/georadarchile.cl-Top target pages-2026-10-26.xlsx')
def norm(path): return urllib.parse.unquote(path).rstrip('/') or '/'
class Extract(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack=[]; self.text=[]; self.headings=[]; self.images=[]; self.links=[]; self.meta={}; self.title=[]; self.canonical=None
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='meta': self.meta[a.get('name',a.get('property',''))]=a.get('content','')
        if tag=='link' and a.get('rel')=='canonical': self.canonical=a.get('href')
        if tag=='img': self.images.append({k:a.get(k) for k in ['src','alt','srcset','width','height']})
        if tag=='a': self.links.append(a.get('href',''))
        if tag not in ['meta','link','img','br','hr','input','source','wbr','area','base','embed','param','track','col']: self.stack.append(tag)
    def handle_endtag(self,tag):
        if tag in self.stack:
            i=len(self.stack)-1-self.stack[::-1].index(tag); self.stack=self.stack[:i]
    def handle_data(self,data):
        t=' '.join(data.split())
        if not t or any(x in self.stack for x in ['script','style','noscript','svg']): return
        if 'title' in self.stack: self.title.append(t)
        if any(x in self.stack for x in ['main','article']): self.text.append(t)
        for h in ['h1','h2','h3']:
            if h in self.stack: self.headings.append([h,t]); break
    def result(self):
        text='\n'.join(self.text)
        return dict(title=' '.join(self.title),canonical=self.canonical,robots=self.meta.get('robots'),description=self.meta.get('description'),headings=self.headings,words=len(text.split()),text=text,images=self.images,links=self.links)
def parse(text):
    p=Extract(); p.feed(text); return p.result()
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self,*args,**kwargs): return None
opener=urllib.request.build_opener(NoRedirect)
def get(url):
    url=urllib.parse.quote(url,safe=':/?=&%+#')
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'GeoRadarMigrationAudit/1.0'})
        try: r=opener.open(req,timeout=35)
        except urllib.error.HTTPError as e: r=e
        text=r.read().decode('utf-8',errors='replace')
        return dict(url=url,status=r.code,location=r.headers.get('Location'),xRobots=r.headers.get('X-Robots-Tag'),**parse(text))
    except Exception as e: return dict(url=url,error=str(e))
perf=pd.read_excel(PERF,sheet_name=2); links=pd.read_excel(LINKS)
prior={}
for _,r in perf.iterrows():
    path=norm(urllib.parse.urlparse(r.iloc[0]).path)
    v=prior.setdefault(path,dict(path=path,clicks=0,impressions=0,backlinks=0))
    v['clicks']+=int(r.iloc[1]); v['impressions']+=int(r.iloc[2])
for _,r in links.iterrows():
    path=norm(urllib.parse.urlparse(r.iloc[0]).path)
    v=prior.setdefault(path,dict(path=path,clicks=0,impressions=0,backlinks=0)); v['backlinks']+=int(r.iloc[1])
redirects={norm(r['from']):r['to'] for r in json.loads((ROOT/'src/_data/redirects.json').read_text(encoding='utf-8'))}
rows=[]; jobs={}
pool=concurrent.futures.ThreadPoolExecutor(max_workers=6)
for path,v in sorted(prior.items(),key=lambda kv:(-kv[1]['clicks'],-kv[1]['backlinks'])):
    target=redirects.get(path,path.rstrip('/')+'/' if path!='/' else '/')
    f=ROOT/'_site'/target.lstrip('/')/'index.html'
    v['target']=target; v['local']=parse(f.read_text(encoding='utf-8')) if f.exists() else {'error':'missing local route'}
    for kind,url in [('wix','https://www.georadarchile.cl'+path),('stagingOriginal','https://georadarchile-cl.pages.dev'+path),('stagingTarget','https://georadarchile-cl.pages.dev'+target)]:
        jobs[pool.submit(get,url)]=(v,kind)
    rows.append(v)
for future in concurrent.futures.as_completed(jobs):
    v,kind=jobs[future]; v[kind]=future.result()
pool.shutdown()
extra=['/industrias/mineria','/industrias/construccion','/blog/hashtags/Georadar','/post/geo-radar-excavacion-exploratoria-prospeccion-no-destructiva','/usos-aplicaciones-gpr']
extras=[dict(path=p,staging=get('https://georadarchile-cl.pages.dev'+p)) for p in extra]
report=dict(checkedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),sources=[str(PERF),str(LINKS)],method='HTTP GET without following redirects; SSR main/article text; no rendered Wix DOM or schema conclusions. Word count is diagnostic, not proof of content parity.',pages=rows,extras=extras)
(OUT/'evidence.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
for i,v in enumerate(rows):
    for kind in ['wix','local','stagingTarget']:
        (OUT/f'{i:02d}-{kind}.txt').write_text(json.dumps({k:v[kind].get(k) for k in ['title','canonical','headings','text']},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps([dict(path=r['path'],clicks=r['clicks'],backlinks=r['backlinks'],wix=r['wix'].get('status',r['wix'].get('error')),original=r['stagingOriginal'].get('status',r['stagingOriginal'].get('error')),target=r['stagingTarget'].get('status',r['stagingTarget'].get('error')),words=[r[k].get('words') for k in ['wix','local','stagingTarget']],titleChanged=r['wix'].get('title')!=r['local'].get('title')) for r in rows],ensure_ascii=True))
print('EXTRAS',json.dumps([dict(path=r['path'],status=r['staging'].get('status'),location=r['staging'].get('location')) for r in extras]))

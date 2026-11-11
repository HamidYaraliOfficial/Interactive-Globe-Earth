#!/usr/bin/env python3
"""Builds data/world.js and data/c/<A3>.js from Natural Earth (public domain) + mledoze/countries (ODbL). Author: Hamid Yarali"""
import json, math, os, urllib.request
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
F = lambda n: json.load(open(f'cache/{n}.geojson'))['features']
def num(n):
    n = ~(n << 1) if n < 0 else n << 1; s = ''
    while n >= 32: s += chr((32 | (n & 31)) + 63); n >>= 5
    return s + chr(n + 63)
def enc(pts):
    o, a, b = '', 0, 0
    for lo, la in pts:
        x, y = round(lo * 100), round(la * 100); o += num(y - a) + num(x - b); a, b = y, x
    return o
def sph(r): return abs(sum(math.radians(x2 - x1) * (2 + math.sin(math.radians(y1)) + math.sin(math.radians(y2))) for (x1, y1), (x2, y2) in zip(r, r[1:]))) * 6371.0088 ** 2 / 2
def area(g): return round(sum(sph(list(p.exterior.coords)) - sum(sph(list(h.coords)) for h in p.interiors) for p in (g.geoms if g.geom_type == 'MultiPolygon' else [g]) if p.geom_type == 'Polygon'))
def polys(g, tol, keep=0.0004):
    g = g.simplify(tol, preserve_topology=True) if tol else g
    ps = list(g.geoms) if g.geom_type in ('MultiPolygon', 'GeometryCollection') else [g]
    ps = [p for p in ps if p.geom_type == 'Polygon' and not p.is_empty]
    big = [p for p in ps if p.area >= keep] or sorted(ps, key=lambda p: -p.area)[:1]
    return [[enc(r.coords) for r in [p.exterior] + [h for h in p.interiors if h.length > .15]] for p in big]
def lines(g, tol):
    g = g.simplify(tol) if tol else g
    return [enc(l.coords) for l in (g.geoms if g.geom_type.startswith('Multi') else [g])]
P = lambda f, *k: next((f['properties'][x] for x in k if f['properties'].get(x) not in (None, '')), '')
rp = lambda g: [round(v, 2) for v in g.representative_point().coords[0]]
# --- facts (mledoze) ---
M = {c['cca3']: c for c in json.load(open('/tmp/mle.json'))}
# --- places ---
PL = [(f['properties'], f['geometry']['coordinates']) for f in F('ne_10m_populated_places')]
caps, tzs = {}, {}
for p, c in PL:
    if p.get('ADM0CAP') == 1 and 'Admin-0' in (p.get('FEATURECLA') or ''):
        caps.setdefault(p['ADM0_A3'], []).append(P({'properties': p}, 'NAME_EN', 'NAME'))
        if p.get('TIMEZONE'): tzs.setdefault(p['ADM0_A3'], []).append(p['TIMEZONE'])
# --- countries ---
CF = [(f, shape(f['geometry'])) for f in F('ne_50m_admin_0_countries') if P(f, 'ADM0_A3') != 'ATA']
iso2adm = {P(f, 'ISO_A3_EH', 'ISO_A3'): P(f, 'ADM0_A3') for f, _ in CF}
C = []
for f, g in CF:
    a3 = P(f, 'ADM0_A3'); m = M.get(P(f, 'ISO_A3_EH', 'ISO_A3')) or M.get(a3) or {}
    tr = (m.get('translations') or {}); fa = P(f, 'NAME_FA') or (tr.get('fas') or tr.get('per') or {}).get('common', '')
    idd = m.get('idd') or {}; call = (idd.get('root', '') + (idd['suffixes'][0] if len(idd.get('suffixes') or []) == 1 else '')) if idd.get('root') else ''
    cur = [f"{v['name']} ({v.get('symbol', '')})" if v.get('symbol') else v['name'] for v in (m.get('currencies') or {}).values()]
    C.append([a3, P(f, 'NAME_EN', 'NAME'), fa, P(f, 'FORMAL_EN'), P(f, 'CONTINENT'), P(f, 'SUBREGION'), P(f, 'POP_EST'), P(f, 'GDP_MD'), P(f, 'INCOME_GRP'), P(f, 'ECONOMY'), P(f, 'ISO_A2'), area(g), caps.get(a3, []),
              m.get('flag', ''), list((m.get('languages') or {}).values()), cur, call, [iso2adm[b] for b in m.get('borders', []) if b in iso2adm], (m.get('tld') or [''])[0], ((m.get('demonyms') or {}).get('eng') or {}).get('m', ''), sorted(set(tzs.get(a3, []))), polys(g, .02, 0)])
tree = STRtree([g for _, g in CF]); A3 = [P(f, 'ADM0_A3') for f, _ in CF]
def owners(geo): return [A3[i] for i in tree.query(geo, predicate='intersects')]
D = {c[0]: dict(p=[], r=[], l=[], t=[], k=[]) for c in C}
S = []  # search index: [type, en, fa, a3, lon, lat]
for f in F('ne_10m_admin_1_states_provinces'):
    p = f['properties']; g = shape(f['geometry']); a3 = p['adm0_a3']
    if a3 not in D: continue
    code = 'IR-32' if p['name'] == 'Alborz' else p.get('iso_3166_2') or ''
    en, fa = p.get('name_en') or p.get('name') or '', p.get('name_fa') or ''
    D[a3]['p'].append([en, fa, p.get('type_en') or p.get('type') or '', code, area(g), polys(g, .03)])
    if en or fa: S.append(['p', en, fa, a3, *rp(g)])
for f in F('ne_10m_rivers_lake_centerlines_scale_rank'):
    g = shape(f['geometry']); rec = [P(f, 'name_en', 'name'), P(f, 'name_fa'), lines(g, .03), round(g.length * 111)]
    for a in set(owners(g)): D[a]['r'].append(rec)
for f in F('ne_10m_lakes'):
    g = shape(f['geometry']); rec = [P(f, 'name_en', 'name'), P(f, 'name_fa'), polys(g, .03, .002)]
    for a in set(owners(g)): D[a]['l'].append(rec)
for f in F('ne_10m_geography_regions_elevation_points'):
    c = f['geometry']['coordinates']; n = P(f, 'name_en', 'name')
    if not n: continue
    rec = [n, P(f, 'name_fa'), P(f, 'elevation'), round(c[0], 3), round(c[1], 3)]
    for a in set(owners(Point(c))): D[a]['k'].append(rec)
    S.append(['k', n, rec[1], (owners(Point(c)) or [''])[0], rec[3], rec[4]])
byc = {}
for p, c in PL:
    if p.get('SCALERANK') is None or 'station' in (p.get('FEATURECLA') or '').lower(): continue
    a3 = p['ADM0_A3']; en = P({'properties': p}, 'NAME_EN', 'NAME')
    rec = [en, p.get('NAME_FA') or '', p.get('POP_MAX') or 0, round(c[0], 2), round(c[1], 2), int('Admin-0' in (p.get('FEATURECLA') or '')), p.get('TIMEZONE') or '']
    byc.setdefault(a3, []).append(rec)
    if rec[5] or rec[2] >= 300000: S.append(['t', en, rec[1], a3, rec[3], rec[4]])
for a3, v in byc.items():
    if a3 in D: D[a3]['t'] = sorted(v, key=lambda r: (-r[5], -r[2]))[:120]
# --- marine + regions (global) ---
M_ = [[P(f, 'name_en', 'name'), P(f, 'name_fa'), f['properties']['featurecla'], f['properties']['scalerank'], polys(shape(f['geometry']), .12, 0), *rp(shape(f['geometry']))] for f in F('ne_10m_geography_marine_polys')]
KEEP = {'Island', 'Island group', 'Range/mtn', 'Plateau', 'Desert', 'Pen/cape', 'Plain', 'Delta', 'Peninsula', 'Basin'}
G = []
for f in F('ne_10m_geography_regions_polys'):
    cl = P(f, 'FEATURECLA')
    if cl not in KEEP or not P(f, 'NAME_EN', 'NAME'): continue
    g = shape(f['geometry']); isl = cl.startswith('Island')
    G.append([P(f, 'NAME_EN', 'NAME'), P(f, 'NAME_FA'), cl, area(g), polys(g, .01 if isl else .06, 0), *rp(g)])
os.makedirs('../data/c', exist_ok=True)
for a3, d in D.items():
    open(f'../data/c/{a3}.js', 'w', encoding='utf-8').write(f'window.CD&&CD({json.dumps(a3)},' + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ');')
open('../data/world.js', 'w', encoding='utf-8').write('/* Generated by tools/build_data.py. Natural Earth (public domain); facts: mledoze/countries (ODbL). Polylines: Google encoding, 1e-2 */\nwindow.W=' + json.dumps(dict(c=C, s=S, m=M_, g=G), ensure_ascii=False, separators=(',', ':')) + ';')
print(len(C), len(S), len(M_), len(G), os.path.getsize('../data/world.js') // 1024, 'KB world;', sum(os.path.getsize('../data/c/' + x) for x in os.listdir('../data/c')) // 1024, 'KB per-country total; IRN', os.path.getsize('../data/c/IRN.js') // 1024, 'KB')

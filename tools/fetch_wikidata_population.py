#!/usr/bin/env python3
"""UNTESTED (the authoring sandbox cannot reach Wikidata). Writes data/pop.js = {ISO 3166-2 code: latest population} from Wikidata.
Run on your own machine:  python3 tools/fetch_wikidata_population.py   (needs internet; takes a few minutes)"""
import json, time, urllib.parse, urllib.request
Q = 'SELECT ?iso ?pop ?t WHERE { ?r wdt:P300 ?iso . ?r p:P1082 ?s . ?s ps:P1082 ?pop . OPTIONAL { ?s pq:P585 ?t } FILTER(STRSTARTS(?iso,"%s-")) }'
data = json.load(open('/dev/stdin')) if False else None
import re
codes = sorted(set(re.findall(r'"a2":"([A-Z]{2})"', '')) ) or [a + b for a in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' for b in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ']
best = {}
for cc in codes:
    url = 'https://query.wikidata.org/sparql?format=json&query=' + urllib.parse.quote(Q % cc)
    try:
        rows = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'interactive-globe/1.0 (Hamid Yarali)'}), timeout=60))['results']['bindings']
    except Exception: continue
    for r in rows:
        t = r.get('t', {}).get('value', '')
        if r['iso']['value'] not in best or t > best[r['iso']['value']][1]: best[r['iso']['value']] = (int(float(r['pop']['value'])), t)
    time.sleep(1)
open('data/pop.js', 'w').write('window.POP=' + json.dumps({k: v[0] for k, v in best.items()}) + ';')
print(len(best), 'regions')

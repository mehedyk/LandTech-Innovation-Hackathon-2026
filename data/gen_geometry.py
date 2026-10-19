"""Schematic parcel geometry and simulated identity-check results (DUMMY, deterministic).

Reads seed_registry.json, writes parcel_geometry.json and identity_demo.json next to it.
Nothing here is a survey, a real boundary, an NID or a biometric template:
- Each mouza is a 100 x 70 sheet in arbitrary units. Parcels are packed in two rows, widths proportional to area.
- 'rs' and 'bs' are the same parcel as two survey outlines; the BS outline is the RS outline with small drift, so the
  overlay has something to show. The drift is random and means nothing.
- identity_demo.json holds a made-up result per person for the simulated fingerprint step. No templates, no photos.
Usage: python3 data/gen_geometry.py   (does not touch the registry or the rules)
"""
import json, os, random
HERE = os.path.dirname(os.path.abspath(__file__))
R = random.Random(20261019)
reg = json.load(open(os.path.join(HERE, 'seed_registry.json'), encoding='utf-8'))
khat = {k['khatian_uid']: k for k in reg['khatians']}
W, H, GAP, ROAD = 100.0, 70.0, 1.6, 6.0

def outline(x, y, w, h, drift):
    """Five-point outline with a small wobble on each corner and a bend on the top edge."""
    j = lambda: R.uniform(-drift, drift)
    return [[round(x + j(), 2), round(y + j(), 2)], [round(x + w / 2 + j(), 2), round(y + j() * 1.5, 2)],
            [round(x + w + j(), 2), round(y + j(), 2)], [round(x + w + j(), 2), round(y + h + j(), 2)],
            [round(x + j(), 2), round(y + h + j(), 2)]]

out = {'_meta': {'note': 'FICTIONAL SCHEMATIC GEOMETRY. Not a survey, not real boundaries. Units are arbitrary.',
                 'sheet': {'w': W, 'h': H}, 'seed': 20261019}, 'mouzas': {}, 'parcels': {}}
rh = (H - ROAD - GAP) / 2
for mz in reg['mouzas']:
    ps = [p for p in reg['parcel_lineages'] if p['mouza_id'] == mz['mouza_id']]
    out['mouzas'][mz['mouza_id']] = {'road': {'x': 0, 'y': round(rh + GAP / 2, 2), 'w': W, 'h': ROAD}}
    for row in (0, 1):
        rp = ps[row * 4:(row + 1) * 4]
        tot = sum(p['area_dec'] for p in rp)
        x = 0.0
        for p in rp:
            w = (W - GAP * (len(rp) - 1)) * p['area_dec'] / tot
            y = 0.0 if row == 0 else rh + ROAD + GAP
            rs = outline(x, y, w, rh, 0.5)
            lat = khat[p['bs']]
            drift = 1.6 if lat['land_class'] == 'khas' else 0.9
            bs = outline(x, y, w, rh, drift)
            out['parcels'][p['lineage']] = {'mouza_id': mz['mouza_id'], 'rs': rs, 'bs': bs,
                                            'label': [round(x + w / 2, 2), round(y + rh / 2, 2)]}
            x += w + GAP

# Simulated fingerprint step: one stored made-up result per person.
fixed = {}
for lin, status in {'L17': 'mismatch', 'L03': 'not_enrolled'}.items():
    p = next(q for q in reg['parcel_lineages'] if q['lineage'] == lin)
    fixed[khat[p['bs']]['owners'][0]['party_id']] = status
ident = {'_meta': {'note': 'FICTIONAL. A made-up result per person for a simulated fingerprint step. No sensor, no template, no photo, no NID.',
                   'values': ['matched', 'mismatch', 'not_enrolled']}, 'people': {}}
for pt in reg['parties']:
    ident['people'][pt['party_id']] = fixed.get(pt['party_id'], 'matched' if R.random() < 0.9 else 'not_enrolled')
json.dump(out, open(os.path.join(HERE, 'parcel_geometry.json'), 'w'), separators=(',', ':'))
json.dump(ident, open(os.path.join(HERE, 'identity_demo.json'), 'w'), separators=(',', ':'))
print(len(out['parcels']), 'parcels;', len(ident['people']), 'people')

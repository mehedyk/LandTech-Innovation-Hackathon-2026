"""Schematic parcel geometry (DUMMY, deterministic).

Reads seed_registry.json, writes parcel_geometry.json next to it.
Nothing here is a survey or a real boundary:
- Each mouza is a 100 x 70 sheet in arbitrary units. Parcels are irregular, rounded plots from an area-weighted Voronoi layout (no rectangles, no road).
- 'rs' and 'bs' are the same parcel as two survey outlines; the BS outline is the RS outline with small drift, so the
  overlay has something to show. The drift is random and means nothing.
Usage: python3 data/gen_geometry.py   (does not touch the registry or the rules)
"""
import json, os, random
HERE = os.path.dirname(os.path.abspath(__file__))
R = random.Random(20261019)
reg = json.load(open(os.path.join(HERE, 'seed_registry.json'), encoding='utf-8'))
khat = {k['khatian_uid']: k for k in reg['khatians']}
W, H = 100.0, 70.0
GAP = 1.5  # lane between neighbouring parcels, in sheet units

def clip(poly, a, b, c):
    """Keep the part of a convex polygon where a*x + b*y <= c (Sutherland-Hodgman, one half-plane)."""
    out = []
    for i, p in enumerate(poly):
        q = poly[(i + 1) % len(poly)]
        fp, fq = a * p[0] + b * p[1] - c, a * q[0] + b * q[1] - c
        if fp <= 0:
            out.append(p)
        if (fp < 0 < fq) or (fq < 0 < fp):
            t = fp / (fp - fq)
            out.append((p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])))
    return out

def centroid(poly):
    a = cx = cy = 0.0
    for i, p in enumerate(poly):
        q = poly[(i + 1) % len(poly)]
        k = p[0] * q[1] - q[0] * p[1]
        a += k; cx += (p[0] + q[0]) * k; cy += (p[1] + q[1]) * k
    return (cx / (3 * a), cy / (3 * a)) if abs(a) > 1e-9 else (sum(p[0] for p in poly) / len(poly), sum(p[1] for p in poly) / len(poly))

def organic(poly):
    """Turn a convex cell into a lane-separated, irregular, rounded plot: inset, wobble the edges, round the corners."""
    cx, cy = centroid(poly)
    r = sum(((p[0] - cx) ** 2 + (p[1] - cy) ** 2) ** .5 for p in poly) / len(poly)
    k = max(0.55, 1 - GAP / r)
    pts = [(cx + (x - cx) * k, cy + (y - cy) * k) for x, y in poly]
    wob = []                                   # bend every edge: add a displaced midpoint
    for i, p in enumerate(pts):
        q = pts[(i + 1) % len(pts)]
        dx, dy = q[0] - p[0], q[1] - p[1]
        ln = (dx * dx + dy * dy) ** .5 or 1.0
        o = R.uniform(-.09, .09) * ln
        wob += [p, ((p[0] + q[0]) / 2 - dy / ln * o, (p[1] + q[1]) / 2 + dx / ln * o)]
    for _ in range(2):                         # Chaikin corner cutting rounds the outline
        nxt = []
        for i, p in enumerate(wob):
            q = wob[(i + 1) % len(wob)]
            nxt += [(.75 * p[0] + .25 * q[0], .75 * p[1] + .25 * q[1]), (.25 * p[0] + .75 * q[0], .25 * p[1] + .75 * q[1])]
        wob = nxt
    return [[round(x, 2), round(y, 2)] for x, y in wob]

def resurvey(ring, drift):
    """The BS outline: the same plot as the RS outline, nudged a little, so the overlay has something to show."""
    sx, sy = R.uniform(-drift, drift) * .6, R.uniform(-drift, drift) * .6
    return [[round(x + sx + R.uniform(-drift, drift) * .7, 2), round(y + sy + R.uniform(-drift, drift) * .7, 2)] for x, y in ring]

out = {'_meta': {'note': 'FICTIONAL SCHEMATIC GEOMETRY. Not a survey, not real boundaries. Units are arbitrary.',
                 'sheet': {'w': W, 'h': H}, 'seed': 20261019}, 'mouzas': {}, 'parcels': {}}
for mz in reg['mouzas']:
    ps = [p for p in reg['parcel_lineages'] if p['mouza_id'] == mz['mouza_id']]
    out['mouzas'][mz['mouza_id']] = {}
    # Seeds on a jittered 4 x 2 grid; a power diagram (weights follow each parcel's area) gives irregular, convex cells.
    cols, rows = 4, 2
    mean = sum(p['area_dec'] for p in ps) / len(ps)
    seeds = []
    for i, p in enumerate(ps):
        gx, gy = i % cols, i // cols
        sx = (gx + .5) * W / cols + R.uniform(-.2, .2) * W / cols
        sy = (gy + .5) * H / rows + R.uniform(-.2, .2) * H / rows
        wgt = max(-220.0, min(220.0, (p['area_dec'] / mean - 1) * 160))
        seeds.append((sx, sy, wgt))
    for i, p in enumerate(ps):
        cell = [(0.0, 0.0), (W, 0.0), (W, H), (0.0, H)]
        xi, yi, wi = seeds[i]
        for j, (xj, yj, wj) in enumerate(seeds):
            if j == i:
                continue
            # points nearer (in power distance) to seed i than seed j
            cell = clip(cell, 2 * (xj - xi), 2 * (yj - yi), (xj * xj + yj * yj - wj) - (xi * xi + yi * yi - wi))
        rs = organic(cell)
        lat = khat[p['bs']]
        bs = resurvey(rs, 1.5 if lat['land_class'] == 'khas' else .8)
        cx, cy = centroid([tuple(q) for q in rs])
        out['parcels'][p['lineage']] = {'mouza_id': mz['mouza_id'], 'rs': rs, 'bs': bs, 'label': [round(cx, 2), round(cy, 2)]}

json.dump(out, open(os.path.join(HERE, 'parcel_geometry.json'), 'w'), separators=(',', ':'))
print(len(out['parcels']), 'parcels')

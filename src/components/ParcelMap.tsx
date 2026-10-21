import { useState } from 'react';
import { geoOf, inView, neighboursOf, points, viewOf } from '../lib/geo.ts';
import { useLang } from '../lib/i18n.tsx';
import { toBn } from '../lib/strings.ts';
import { mouzaOf, parcelOf, chainOf } from '../lib/registry.ts';
import { landClass } from '../lib/report.ts';
import type { Tone } from './Audit.tsx';

type Layer = 'rs' | 'bs' | 'both';

/**
 * Schematic parcel map. The geometry is made up (data/parcel_geometry.json), so this shows the idea of a map
 * overlay, not a real boundary. Officers see neighbouring parcel ids and can open them; citizens see only the plot.
 */
export default function ParcelMap({ lineage, tone, mode }: { lineage: string; tone: Tone; mode: 'officer' | 'citizen' }) {
  const { t, lang } = useLang();
  const [layer, setLayer] = useState<Layer>('both');
  const g = geoOf(lineage);
  const parcel = parcelOf(lineage);
  const latest = chainOf(lineage).at(-1);
  if (!g || !parcel || !latest) return null;
  const m = mouzaOf(parcel.mouza_id);
  const v = viewOf(lineage);
  const areaLabel = lang === 'bn' ? toBn(parcel.area_dec) : String(parcel.area_dec);
  const fs = v.w / 100; // text scales with the zoom so labels keep the same on-screen size
  const near = neighboursOf(lineage).filter(([, n]) => inView(v, n.rs));
  const showRs = layer !== 'bs';
  const showBs = layer !== 'rs';
  const LAYERS: { key: Layer; label: string }[] = [
    { key: 'rs', label: t('map.rs') }, { key: 'bs', label: t('map.bs') }, { key: 'both', label: t('map.both') },
  ];

  return (
    <section className="card ag-section ag-map" aria-label={t('sec.map')}>
      <div className="ag-map-head">
        <div>
          <h2>{t('sec.map')}</h2>
          <p className="ag-sub">{t('map.sub', { mouza: m?.name ?? '', upazila: m?.upazila ?? '', district: m?.district ?? '' })}</p>
        </div>
        <div className="ag-seg" role="group" aria-label={t('map.layers')}>
          {LAYERS.map((l) => (
            <button key={l.key} type="button" aria-pressed={layer === l.key} onClick={() => setLayer(l.key)}>{l.label}</button>
          ))}
        </div>
      </div>

      <div className="ag-map-body">
        <svg className="ag-map-svg" viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} role="img"
          aria-label={t('map.alt', { id: lineage, area: parcel.area_dec, mouza: m?.name ?? '' })}>
          <rect className="ag-map-sheet" x={v.x} y={v.y} width={v.w} height={v.h} />
          {near.map(([id, n]) => {
            const poly = <polygon className="ag-map-nb" style={{ strokeWidth: fs * 0.5 }} points={points(layer === 'bs' ? n.bs : n.rs)} />;
            const showId = inView(v, [n.label]);
            return mode === 'officer'
              ? <a key={id} href={`#/cases/${id}`} aria-label={t('v.openParcel', { id })}>{poly}{showId && <text className="ag-map-nbl" style={{ fontSize: fs * 3.4 }} x={n.label[0]} y={n.label[1]} textAnchor="middle">{id}</text>}</a>
              : <g key={id}>{poly}</g>;
          })}
          {showRs && <polygon className="ag-map-sel" style={{ strokeWidth: fs * 1.1 }} data-tone={tone} data-layer="rs" points={points(g.rs)} />}
          {showBs && <polygon className="ag-map-sel ag-map-bs" style={{ strokeWidth: fs * 0.6, strokeDasharray: `${fs * 2} ${fs * 1.3}` }} data-tone={tone} data-layer="bs" points={points(g.bs)} />}
          <text className="ag-map-sell" style={{ fontSize: fs * 5 }} x={g.label[0]} y={g.label[1] - fs} textAnchor="middle">{lineage}</text>
          <text className="ag-map-sela" style={{ fontSize: fs * 3.8 }} x={g.label[0]} y={g.label[1] + fs * 5} textAnchor="middle">{areaLabel}</text>
        </svg>
        <div className="ag-map-side">
          <ul className="ag-legend">
            <li><i className="ag-sw ag-sw-sel" data-tone={tone} /> {t('map.legendSel')}</li>
            <li><i className="ag-sw ag-sw-bs" /> {t('map.legendBs')}</li>
            <li><i className="ag-sw ag-sw-nb" /> {t('map.legendNb')}</li>
          </ul>
          <dl className="ag-dl ag-map-facts">
            <div><dt>{t('xfer.parcelArea')}</dt><dd>{t('chain.areaVal', { area: latest.area_dec })}</dd></div>
            <div><dt>{t('map.class')}</dt><dd>{landClass(lang, latest.land_class)}</dd></div>
            <div><dt>{t('map.mouza')}</dt><dd>{m?.name}</dd></div>
          </dl>
        </div>
      </div>
      <p className="ag-fine">{t('map.note')}</p>
    </section>
  );
}

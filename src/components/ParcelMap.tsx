import { useState } from 'react';
import { geoOf, neighboursOf, points, roadOf, SHEET } from '../lib/geo.ts';
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
  const road = roadOf(parcel.mouza_id);
  const pad = 2;
  const wide = Math.max(...g.rs.map((q) => q[0])) - Math.min(...g.rs.map((q) => q[0])) >= 24; // narrow plots get the number only
  const areaLabel = wide ? t('chain.areaVal', { area: parcel.area_dec }) : lang === 'bn' ? toBn(parcel.area_dec) : String(parcel.area_dec);
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

      <svg className="ag-map-svg" viewBox={`${-pad} ${-pad} ${SHEET.w + pad * 2} ${SHEET.h + pad * 2}`} role="img"
        aria-label={t('map.alt', { id: lineage, area: parcel.area_dec, mouza: m?.name ?? '' })}>
        <rect className="ag-map-sheet" x={-pad} y={-pad} width={SHEET.w + pad * 2} height={SHEET.h + pad * 2} />
        {road && <rect className="ag-map-road" x={road.x} y={road.y} width={road.w} height={road.h} />}
        {neighboursOf(lineage).map(([id, n]) => {
          const poly = <polygon className="ag-map-nb" points={points(layer === 'bs' ? n.bs : n.rs)} />;
          return mode === 'officer'
            ? <a key={id} href={`#/cases/${id}`} aria-label={t('v.openParcel', { id })}>{poly}<text className="ag-map-nbl" x={n.label[0]} y={n.label[1]} textAnchor="middle">{id}</text></a>
            : <g key={id}>{poly}</g>;
        })}
        {showRs && <polygon className="ag-map-sel" data-tone={tone} data-layer="rs" points={points(g.rs)} />}
        {showBs && <polygon className="ag-map-sel ag-map-bs" data-tone={tone} data-layer="bs" points={points(g.bs)} />}
        <text className="ag-map-sell" x={g.label[0]} y={g.label[1] - 1} textAnchor="middle">{lineage}</text>
        <text className="ag-map-sela" x={g.label[0]} y={g.label[1] + 4.5} textAnchor="middle">{areaLabel}</text>
      </svg>

      <ul className="ag-legend">
        <li><i className="ag-sw ag-sw-sel" data-tone={tone} /> {t('map.legendSel')}</li>
        <li><i className="ag-sw ag-sw-bs" /> {t('map.legendBs')}</li>
        <li><i className="ag-sw ag-sw-nb" /> {t('map.legendNb')}</li>
        <li><i className="ag-sw ag-sw-road" /> {t('map.legendRoad')}</li>
      </ul>
      <dl className="ag-dl ag-map-facts">
        <div><dt>{t('xfer.parcelArea')}</dt><dd>{t('chain.areaVal', { area: latest.area_dec })}</dd></div>
        <div><dt>{t('map.class')}</dt><dd>{landClass(lang, latest.land_class)}</dd></div>
        <div><dt>{t('map.mouza')}</dt><dd>{m?.name}</dd></div>
      </dl>
      <p className="ag-fine">{t('map.note')}</p>
    </section>
  );
}

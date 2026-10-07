import { pct } from '../services/api';
export const NOIMG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="100%" height="100%" fill="#e8f5e9"/><text x="50%" y="50%" fill="#2e7d32" font-size="28" text-anchor="middle" font-family="sans-serif">Vườn Nhà</text></svg>');
export default function Thumb({ p, size = '' }) {
  const off = pct(p);
  return (
    <div className={'thumb ' + size}>
      <img src={p.img || NOIMG} alt={p.name} loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = NOIMG; }} />
      {off > 0 && <span className="badge">-{off}%</span>}
    </div>
  );
}

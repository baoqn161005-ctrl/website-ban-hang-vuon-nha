export default function Pager({ pages, page, onChange }) {
  if (pages < 2) return null;
  const b = (label, p, on) => <button key={label} className={'btn ' + (on ? '' : 'gray')} onClick={() => onChange(p)}>{label}</button>;
  return (
    <div id="pager">
      {page > 1 && b('‹ Trước', page - 1)}
      {Array.from({ length: pages }, (_, i) => b(String(i + 1), i + 1, i + 1 === page))}
      {page < pages && b('Sau ›', page + 1)}
    </div>
  );
}

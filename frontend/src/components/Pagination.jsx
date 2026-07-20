export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  let last = 0;
  return (
    <div className="flex items-center justify-center gap-1 mt-8 font-mono text-sm">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1.5 border border-line rounded-md disabled:opacity-30 hover:border-cobalt transition-colors"
      >
        ←
      </button>
      {pages.map(p => {
        const showEllipsis = p - last > 1;
        last = p;
        return (
          <span key={p} className="flex items-center">
            {showEllipsis && <span className="px-2 text-muted">…</span>}
            <button
              onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-md transition-colors ${p === page ? 'bg-ink text-paper' : 'hover:border-cobalt border border-transparent'}`}
            >
              {p}
            </button>
          </span>
        );
      })}
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1.5 border border-line rounded-md disabled:opacity-30 hover:border-cobalt transition-colors"
      >
        →
      </button>
    </div>
  );
}

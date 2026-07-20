export default function StarRating({ rating = 0, size = 'sm' }) {
  const rounded = Math.round(rating * 2) / 2;
  const dim = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= rounded;
        const half = !filled && n - 0.5 === rounded;
        return (
          <svg key={n} viewBox="0 0 20 20" className={`${dim} ${filled || half ? 'text-amber' : 'text-line'}`} fill="currentColor">
            {half ? (
              <defs>
                <linearGradient id={`half-${n}`}>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
            ) : null}
            <path
              fill={half ? `url(#half-${n})` : 'currentColor'}
              stroke={filled || half ? 'none' : 'currentColor'}
              strokeWidth={filled || half ? 0 : 1}
              d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.2-5.4 3.2 1.3-6-4.6-4.1 6.1-.6z"
            />
          </svg>
        );
      })}
    </span>
  );
}

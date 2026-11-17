import { review } from '../securityLabs'

export function ReviewCard() {
  const total = review.counts.reduce((s, c) => s + c.n, 0)
  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">Real-world assessment</p>
      <h3 className="mt-1 text-lg font-bold">{review.title}</h3>
      <p className="text-sm text-muted">{review.scope}</p>

      <div className="mt-5 flex items-end gap-4">
        <span className="text-5xl font-extrabold leading-none">{total}</span>
        <span className="pb-1 text-sm text-muted">findings, each with a fix</span>
      </div>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full" role="img" aria-label={review.counts.map((c) => `${c.n} ${c.sev}`).join(', ')}>
        {review.counts.map((c) => (
          <span key={c.sev} style={{ width: `${(c.n / total) * 100}%`, background: c.color }} />
        ))}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {review.counts.map((c) => (
          <li key={c.sev} className="flex items-center gap-1.5">
            <i className="h-2 w-2 rounded-full" style={{ background: c.color }} /> {c.n} {c.sev}
          </li>
        ))}
      </ul>

      <ul className="mt-5 space-y-2 text-sm">
        {review.highlights.map((h) => (
          <li key={h} className="flex gap-2"><span className="text-rose-400">▸</span>{h}</li>
        ))}
        <li className="flex gap-2 text-muted"><span className="text-emerald-400">✓</span>Held up: {review.held}</li>
      </ul>
    </article>
  )
}

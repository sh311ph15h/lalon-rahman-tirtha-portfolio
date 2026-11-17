import { useEffect, useRef, useState } from 'react'
import { FaPlay, FaPause } from 'react-icons/fa'
import { labs } from '../securityLabs'

const STEP_MS = 3200

/** Tabbed case files: target card on the left, kill-chain stepper on the right. */
export function LabCaseFiles() {
  const [labIdx, setLabIdx] = useState(0)
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [seen, setSeen] = useState(false)
  const ref = useRef(null)
  const lab = labs[labIdx]

  // Start playing only once the panel is on screen; respect reduced motion.
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setPlaying(false); setSeen(true); return }
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { setSeen(true); return }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!playing || !seen) return
    const t = setTimeout(() => {
      if (step < lab.phases.length - 1) setStep(step + 1)
      else { setStep(0); setLabIdx((labIdx + 1) % labs.length) }
    }, STEP_MS)
    return () => clearTimeout(t)
  }, [playing, seen, step, labIdx, lab.phases.length])

  const pick = (i) => { setLabIdx(i); setStep(0) }

  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* window bar + tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
        <span className="mr-2 flex gap-1.5" aria-hidden>
          <i className="h-3 w-3 rounded-full bg-rose-500/80" /><i className="h-3 w-3 rounded-full bg-amber-400/80" /><i className="h-3 w-3 rounded-full bg-emerald-400/80" />
        </span>
        <div role="tablist" aria-label="Lab case files" className="flex flex-wrap gap-1">
          {labs.map((l, i) => (
            <button
              key={l.id}
              role="tab"
              aria-selected={i === labIdx}
              onClick={() => pick(i)}
              className={`rounded-md px-3 py-1 font-mono text-xs transition ${i === labIdx ? 'bg-accent text-bg' : 'text-muted hover:bg-surface hover:text-text'}`}
            >
              {l.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setPlaying((p) => !p)}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-xs text-muted hover:text-text"
          aria-label={playing ? 'Pause walkthrough' : 'Play walkthrough'}
        >
          {playing ? <FaPause /> : <FaPlay />} {playing ? 'auto' : 'paused'}
        </button>
      </div>

      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        {/* target card */}
        <div className="border-b border-border p-5 md:border-b-0 md:border-r">
          <p className="font-mono text-xs uppercase tracking-wider text-accent">{lab.kind}</p>
          <h3 className="mt-1 text-xl font-bold">{lab.name}</h3>
          <p className="text-sm text-muted">{lab.target} · {lab.date}</p>

          <p className="mt-5 font-mono text-xs uppercase tracking-wider text-muted">Attack surface</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">
            {lab.ports.map((p) => (
              <li key={p.port} className="flex gap-3">
                <span className={`w-20 shrink-0 ${p.hot ? 'text-rose-400' : 'text-emerald-400'}`}>{p.port}</span>
                <span className={p.hot ? 'text-text' : 'text-muted'}>{p.svc}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 font-mono text-xs uppercase tracking-wider text-muted">Root cause</p>
          <p className="mt-1 text-sm leading-relaxed">{lab.finding}</p>
        </div>

        {/* kill chain */}
        <div className="p-5">
          <ol className="relative space-y-1">
            {lab.phases.map((ph, i) => {
              const state = i < step ? 'done' : i === step ? 'now' : 'next'
              return (
                <li key={ph.phase}>
                  <button
                    onClick={() => { setStep(i); setPlaying(false) }}
                    className={`group flex w-full gap-3 rounded-lg p-2.5 text-left transition ${state === 'now' ? 'bg-surface-2' : 'hover:bg-surface-2/60'}`}
                  >
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition
                      ${state === 'done' ? 'border-emerald-400 bg-emerald-400/15 text-emerald-300' : state === 'now' ? 'border-accent bg-accent text-bg' : 'border-border text-muted'}`}>
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className={`font-semibold ${state === 'next' ? 'text-muted' : ''}`}>{ph.phase}</span>
                        {ph.attack !== '—' && (
                          <span className="rounded bg-accent-2/15 px-1.5 font-mono text-[11px] text-accent-2">ATT&amp;CK {ph.attack}</span>
                        )}
                      </span>
                      <span className={`mt-0.5 block text-sm leading-relaxed transition-opacity ${state === 'next' ? 'text-muted/60' : 'text-muted'}`}>{ph.text}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-3 text-sm">
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-300">Fix · </span>
            {lab.lesson}
          </div>
          {/* progress */}
          <div className="mt-4 h-1 overflow-hidden rounded bg-surface-2">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${((step + 1) / lab.phases.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

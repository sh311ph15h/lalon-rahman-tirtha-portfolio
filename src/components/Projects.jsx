import { useEffect, useRef, useState } from 'react'
import { FaGithub, FaExternalLinkAlt, FaServer, FaLock, FaPlay, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Section } from './Section'
import { projects, profile } from '../data'

const N = projects.length
const STEP = 360 / N                      // degrees between neighbouring cards on the ring
const mod = (i) => ((i % N) + N) % N

function Links({ p }) {
  const cls = 'inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-accent'
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
      {p.live && <a className={cls} href={p.live} target="_blank" rel="noreferrer"><FaExternalLinkAlt /> {p.liveLabel || 'Live'}</a>}
      {p.code && <a className={cls} href={p.code} target="_blank" rel="noreferrer"><FaGithub /> {p.server ? 'Client' : 'Code'}</a>}
      {p.server && <a className={cls} href={p.server} target="_blank" rel="noreferrer"><FaServer /> Server</a>}
      {!p.live && !p.code && <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted"><FaLock /> Private · in development</span>}
    </div>
  )
}

/**
 * All projects stand on a 3D ring. Drag, use the arrows / arrow keys, or click a card to bring it
 * to the front; the details of the front card are shown underneath. The ring turns by itself
 * until the visitor touches it, and stays still for prefers-reduced-motion.
 */
export function Projects() {
  const stage = useRef(null)
  const drag = useRef(null)
  const [pos, setPos] = useState(0)          // ring position in cards; fractional while dragging
  const [dragging, setDragging] = useState(false)
  const [auto, setAuto] = useState(true)
  const [playing, setPlaying] = useState(null)   // title of the project whose video is open
  const [cardW, setCardW] = useState(340)

  const active = mod(Math.round(pos))
  const p = projects[active]
  const radius = Math.round(cardW / 2 / Math.tan(Math.PI / N)) + 24

  const go = (to) => { setAuto(false); setPlaying(null); setPos(to) }

  // Card size follows the width of the stage.
  useEffect(() => {
    const el = stage.current
    const fit = () => setCardW(Math.max(210, Math.min(380, el.clientWidth * 0.62)))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Turn slowly by itself while on screen, until the visitor takes over.
  useEffect(() => {
    if (!auto || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let visible = false
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.4 })
    io.observe(stage.current)
    const t = setInterval(() => { if (visible && !document.hidden) setPos((v) => v + 1) }, 3600)
    return () => { io.disconnect(); clearInterval(t) }
  }, [auto])

  const down = (e) => {
    if (e.target.closest('video, button')) return
    drag.current = { x: e.clientX, start: pos, moved: false }
  }
  const move = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved && Math.abs(dx) < 6) return
    if (!d.moved) { d.moved = true; setDragging(true); setAuto(false); setPlaying(null); stage.current.setPointerCapture(e.pointerId) }
    setPos(d.start - dx / (cardW * 0.9))
  }
  const up = () => {
    const d = drag.current
    drag.current = null
    if (d?.moved) { setDragging(false); setPos((v) => Math.round(v)) }
  }
  const key = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.round(pos) - 1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.round(pos) + 1) }
  }
  // Rotate the short way round to card i.
  const select = (i) => {
    const cur = Math.round(pos)
    let diff = mod(i - cur)
    if (diff > N / 2) diff -= N
    go(cur + diff)
  }

  const arrow = 'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/90 text-muted shadow-lg shadow-black/40 backdrop-blur transition hover:border-accent/60 hover:text-accent'

  return (
    <Section id="projects" eyebrow="projects" title="Things I've built">
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-[15%] top-[20%] h-[55%] rounded-full bg-gradient-to-r from-accent/15 to-accent-2/15 blur-3xl" />

        <div
          ref={stage}
          role="group"
          aria-roledescription="carousel"
          aria-label="Projects"
          tabIndex={0}
          onKeyDown={key}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="relative cursor-grab touch-pan-y select-none overflow-hidden rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:cursor-grabbing"
          style={{ height: cardW * 0.625 + 150, perspective: 1600 }}
        >
          <div
            className={`orbit-ring absolute left-1/2 top-[46%] ${dragging ? 'is-dragging' : ''}`}
            style={{ width: cardW, marginLeft: -cardW / 2, marginTop: -(cardW * 0.625 + 52) / 2, transform: `translateZ(${-radius}px) rotateY(${-pos * STEP}deg)` }}
          >
            {projects.map((q, i) => {
              const off = Math.abs(mod(i - pos + N / 2) - N / 2)        // distance from the front, in cards
              const front = i === active
              const open = front && playing === q.title
              return (
                <article
                  key={q.title}
                  aria-hidden={!front}
                  onClick={() => { if (!front) select(i) }}
                  className={`orbit-card absolute inset-x-0 top-0 overflow-hidden rounded-xl border bg-surface ${front ? 'border-accent/60 shadow-2xl shadow-accent/20' : 'cursor-pointer border-border'}`}
                  style={{
                    transform: `rotateY(${i * STEP}deg) translateZ(${radius}px)`,
                    opacity: off > N / 4 + 0.6 ? 0 : Math.max(0.16, 1 - off * 0.36),
                    pointerEvents: off > N / 4 + 0.6 ? 'none' : 'auto',
                  }}
                >
                  <div className="relative aspect-[16/10] bg-black">
                    {open ? (
                      <video src={q.video} poster={q.image} controls autoPlay playsInline className="h-full w-full object-contain" aria-label={`${q.title} demo video`} />
                    ) : (
                      <>
                        <img src={q.image} alt={`${q.title} screenshot`} loading="lazy" draggable={false} className="h-full w-full object-cover object-top" />
                        {q.video && front && (
                          <button
                            type="button"
                            onClick={() => { setAuto(false); setPlaying(q.title) }}
                            className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/10"
                            aria-label={`Play ${q.title} demo video`}
                          >
                            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent pl-1 text-lg text-bg shadow-lg shadow-black/50"><FaPlay /></span>
                          </button>
                        )}
                        {q.video && !front && (
                          <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-accent"><FaPlay className="text-[8px]" /> demo</span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex h-[52px] items-center justify-between gap-3 px-4">
                    <h3 className="truncate font-bold">{q.title}</h3>
                    <span className="shrink-0 font-mono text-xs text-muted">{q.year}</span>
                  </div>
                </article>
              )
            })}
          </div>

          <button type="button" aria-label="Previous project" onClick={() => go(Math.round(pos) - 1)} className={`${arrow} left-2 sm:left-4`}><FaChevronLeft /></button>
          <button type="button" aria-label="Next project" onClick={() => go(Math.round(pos) + 1)} className={`${arrow} right-2 sm:right-4`}><FaChevronRight /></button>
        </div>

        <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Choose a project">
          {projects.map((q, i) => (
            <button
              key={q.title}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={q.title}
              title={q.title}
              onClick={() => select(i)}
              className="flex h-6 items-center"
            >
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-7 bg-accent' : 'w-1.5 bg-border hover:bg-muted'}`} />
            </button>
          ))}
        </div>
        <p className="mt-2 text-center font-mono text-xs text-muted">drag, or use ← → · {active + 1} / {N}</p>

        <div key={p.title} aria-live="polite" className="orbit-detail mx-auto mt-8 max-w-2xl text-center">
          <p className="font-mono text-xs text-accent">{p.featured ? 'Featured · ' : ''}{p.year}</p>
          <h3 className="mt-1 text-2xl font-bold">{p.title}</h3>
          <p className="mt-3 leading-relaxed text-muted">{p.summary}</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-1.5">
            {p.tech.map((t) => (
              <li key={t} className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs text-muted">{t}</li>
            ))}
          </ul>
          <div className="mt-5"><Links p={p} /></div>
        </div>
      </div>

      <p className="mt-12 text-center text-muted">
        More on{' '}
        <a href={profile.social.github} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
          GitHub →
        </a>
      </p>
    </Section>
  )
}

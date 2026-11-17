import { useEffect, useRef } from 'react'
import { skills } from '../data'

// One bubble per skill, spread evenly over a sphere (Fibonacci lattice).
// The globe shows the security toolkit; the development stack stays in the cards below.
const DEV_GROUPS = new Set(['Web Development', 'Data & Auth', 'Tools & Cloud'])
const items = []
const seen = new Set()
for (const { group: g, items: group } of skills) {
  if (DEV_GROUPS.has(g)) continue
  for (const s of group) {
    if ((s.icon || s.abbr) && !seen.has(s.name)) { seen.add(s.name); items.push(s) }
  }
}
const points = items.map((_, i) => {
  const y = 1 - (2 * (i + 0.5)) / items.length
  const r = Math.sqrt(1 - y * y)
  const t = Math.PI * (3 - Math.sqrt(5)) * i
  return [Math.cos(t) * r, y, Math.sin(t) * r]
})

/** Text badge for tools that have no logo. */
export function Abbr({ text, className = '' }) {
  return (
    <span className={`font-mono font-bold leading-none tracking-tight ${text.length > 4 ? 'text-[9px]' : 'text-[11px]'} ${className}`}>
      {text}
    </span>
  )
}

/**
 * Icon globe that auto-rotates and can be dragged. Positions are written straight to the DOM
 * each frame (no React re-render); it only animates while on screen and holds still for
 * prefers-reduced-motion. Hovering (or tapping) a bubble pauses the spin and shows its name.
 */
export function SkillSphere() {
  const box = useRef(null)
  const tip = useRef(null)
  const nodes = useRef([])

  useEffect(() => {
    const el = box.current
    const label = tip.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let ax = -0.35, ay = 0.4          // current rotation (radians)
    let vx = 0, vy = 0.004            // angular velocity per frame
    let drag = null, frame = 0, visible = false
    let hover = -1                    // index of the bubble under the pointer

    const placeTip = () => {
      if (hover < 0) { label.style.opacity = 0; return }
      const n = nodes.current[hover]
      const b = el.getBoundingClientRect(), r = n.getBoundingClientRect()
      label.textContent = items[hover].name
      label.style.left = `${r.left - b.left + r.width / 2}px`
      label.style.top = `${r.top - b.top - 8}px`
      label.style.opacity = 1
    }

    const render = () => {
      const R = el.clientWidth / 2 - 26
      const [sx, cx, sy, cy] = [Math.sin(ax), Math.cos(ax), Math.sin(ay), Math.cos(ay)]
      points.forEach(([x, y, z], i) => {
        const x1 = x * cy + z * sy, z1 = -x * sy + z * cy   // rotate around Y
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx  // then around X
        const depth = (z2 + 1) / 2                          // 0 = back, 1 = front
        const n = nodes.current[i]
        const lit = i === hover
        n.style.transform = `translate(-50%, -50%) translate3d(${x1 * R}px, ${y2 * R}px, 0) scale(${(0.55 + depth * 0.6) * (lit ? 1.25 : 1)})`
        n.style.opacity = lit ? 1 : 0.25 + depth * 0.75
        n.style.zIndex = lit ? 200 : Math.round(depth * 100)
        n.style.borderColor = lit ? 'var(--color-accent)' : ''
      })
      placeTip()
    }

    const tick = () => {
      if (!drag && hover < 0) {
        ay += vy; ax += vx
        vy += (0.004 - vy) * 0.02    // ease back to the idle spin after a fling
        vx *= 0.95
      }
      render()
      frame = visible ? requestAnimationFrame(tick) : 0
    }

    const indexOf = (t) => nodes.current.findIndex((n) => n && n.contains(t))
    const over = (e) => {
      if (drag) return
      const i = indexOf(e.target)
      if (i !== hover) { hover = i; render() }
    }
    const leave = () => { hover = -1; render() }

    const down = (e) => {
      // Touch: a tap on a bubble shows its name instead of starting a drag.
      if (e.pointerType !== 'mouse') { const i = indexOf(e.target); if (i >= 0) { hover = i; render() } }
      drag = { x: e.clientX, y: e.clientY, moved: false }
      el.setPointerCapture(e.pointerId)
    }
    const move = (e) => {
      if (!drag) { if (e.pointerType === 'mouse') over(e); return }
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y
      if (!drag.moved && Math.hypot(dx, dy) < 4) return
      if (!drag.moved) { drag.moved = true; hover = -1 }
      vy = dx * 0.006
      vx = -dy * 0.006
      ay += vy; ax += vx
      drag = { x: e.clientX, y: e.clientY, moved: true }
      if (reduce) render()
    }
    const up = (e) => {
      const tapped = drag && !drag.moved
      drag = null
      if (e.pointerType === 'mouse') over(e)
      else if (!tapped) leave()
    }

    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('pointerleave', leave)

    render()
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !reduce
      if (visible && !frame) frame = requestAnimationFrame(tick)
    })
    io.observe(el)
    const onResize = () => render()
    window.addEventListener('resize', onResize)

    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute inset-[12%] rounded-full bg-gradient-to-br from-accent/20 to-accent-2/20 blur-3xl" />
      <div
        ref={box}
        role="img"
        aria-label={`Skills: ${items.map((s) => s.name).join(', ')}`}
        className="relative aspect-square w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
      >
        {items.map(({ name, icon: Icon, abbr }, i) => (
          <span
            key={name}
            ref={(n) => { nodes.current[i] = n }}
            aria-hidden
            className="absolute left-1/2 top-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-surface/90 text-xl text-accent shadow-lg shadow-black/40 will-change-transform"
          >
            {Icon ? <Icon /> : <Abbr text={abbr} />}
          </span>
        ))}
        <div
          ref={tip}
          aria-hidden
          className="pointer-events-none absolute z-[300] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md border border-accent/60 bg-bg/95 px-2.5 py-1 font-mono text-xs font-semibold text-text opacity-0 shadow-lg shadow-black/50 transition-opacity duration-150"
        />
      </div>
      <p className="mt-2 text-center font-mono text-xs text-muted">hover a tool to see its name · drag to spin</p>
    </div>
  )
}

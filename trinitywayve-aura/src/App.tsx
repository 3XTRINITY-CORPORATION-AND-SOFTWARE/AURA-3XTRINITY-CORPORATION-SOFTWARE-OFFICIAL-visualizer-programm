import { useEffect, useRef, useState } from 'react'

const ACCENT = '#A855F7'
const FOOTER =
  'SYSTEM: TRINITYWAYVE | ARCHITECT: THEODOR^%°¢(KÜNNAPUU) | SOURCE: LINDA VIIDING | LÄBIMURDE ANKUR: ACTIVE | STATUS: OMNI-SOVEREIGN'

type Layer = 'presence' | 'threat' | 'trust'

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [layer, setLayer] = useState<Layer>('presence')
  const [playing, setPlaying] = useState(true)
  const [threat, setThreat] = useState(0.25)
  const barsRef = useRef<Float32Array>(new Float32Array(48).fill(0.2))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let running = true
    let t0 = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(canvas.clientWidth * dpr)
      canvas.height = Math.floor(canvas.clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = (now: number) => {
      if (!running) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const t = (now - t0) / 1000

      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, w, h)

      // soft vignette grid
      ctx.strokeStyle = 'rgba(168,85,247,0.05)'
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }

      // simulated spectrum
      const bars = barsRef.current
      for (let i = 0; i < bars.length; i++) {
        const target = playing
          ? 0.15 + 0.55 * Math.abs(Math.sin(t * 2.2 + i * 0.35)) * (0.6 + threat * 0.8)
          : bars[i] * 0.92
        bars[i] += (target - bars[i]) * 0.18
      }

      const cx = w * 0.5
      const cy = h * 0.42
      const ringColor =
        layer === 'threat' ? '#E11D48' : layer === 'trust' ? '#00FF41' : ACCENT

      // outer bloom
      const grd = ctx.createRadialGradient(cx, cy, 20, cx, cy, 180 + threat * 60)
      grd.addColorStop(0, `${ringColor}55`)
      grd.addColorStop(0.5, `${ringColor}22`)
      grd.addColorStop(1, 'transparent')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(cx, cy, 200, 0, Math.PI * 2)
      ctx.fill()

      // concentric rings
      for (let i = 0; i < 4; i++) {
        const r = 40 + i * 28 + Math.sin(t * 1.5 + i) * 4
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `${ringColor}${Math.floor(0.55 * 255).toString(16).padStart(2, '0')}`
        ctx.lineWidth = i === 0 ? 2.5 : 1.2
        ctx.stroke()
      }

      // silhouette
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.beginPath()
      ctx.ellipse(cx, cy - 8, 14, 18, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(cx - 22, cy + 55)
      ctx.quadraticCurveTo(cx, cy + 10, cx + 22, cy + 55)
      ctx.closePath()
      ctx.fill()

      // spectrum dock
      const barW = Math.min(10, (w - 80) / bars.length)
      const baseY = h - 48
      for (let i = 0; i < bars.length; i++) {
        const bh = bars[i] * 90
        const x = w / 2 - (bars.length * barW) / 2 + i * barW
        ctx.fillStyle = `${ringColor}aa`
        ctx.fillRect(x, baseY - bh, barW - 2, bh)
      }

      // HUD chips
      const chips =
        layer === 'presence'
          ? ['SCAN', 'PRESENCE LOCK', 'FIELD STABLE']
          : layer === 'threat'
            ? ['THREAT SPIKE', 'RING ALERT', 'MITIGATE']
            : ['TRUST LAYER', 'COOLING', 'HUD PINNED']
      ctx.font = '11px ui-monospace, monospace'
      chips.forEach((label, i) => {
        const x = 16
        const y = 24 + i * 22
        ctx.fillStyle = 'rgba(0,0,0,0.55)'
        ctx.fillRect(x, y - 12, 120, 18)
        ctx.strokeStyle = `${ringColor}66`
        ctx.strokeRect(x, y - 12, 120, 18)
        ctx.fillStyle = ringColor
        ctx.fillText(label, x + 8, y)
      })

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [layer, playing, threat])

  return (
    <div className="min-h-screen flex flex-col bg-void">
      <header className="border-b border-border px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: ACCENT }}>
            TrinityWayve · Module
          </p>
          <h1 className="text-xl font-bold tracking-tight">Aura Visualizer</h1>
          <p className="text-xs text-white/50 mt-0.5">
            Presence, threat & trust overlays — situational awareness HUD.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center font-mono text-[11px]">
          {(['presence', 'threat', 'trust'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => {
                setLayer(l)
                setThreat(l === 'threat' ? 0.85 : l === 'trust' ? 0.15 : 0.35)
              }}
              className="rounded border px-2.5 py-1 uppercase tracking-wider"
              style={{
                borderColor: layer === l ? ACCENT : '#1a1a1a',
                background: layer === l ? 'rgba(168,85,247,0.15)' : 'transparent',
                color: layer === l ? ACCENT : 'rgba(255,255,255,0.55)',
              }}
            >
              {l}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded border border-white/15 px-2.5 py-1 text-white/70 hover:bg-white/5"
          >
            {playing ? 'Pause' : 'Play'}
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        <div className="absolute right-4 bottom-4 rounded-md border border-border bg-black/70 px-3 py-2 font-mono text-[11px] text-white/60 backdrop-blur max-w-xs">
          <div>
            Layer: <span style={{ color: ACCENT }}>{layer.toUpperCase()}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-white/35">Intensity</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={threat}
              onChange={(e) => setThreat(Number(e.target.value))}
              className="w-28 accent-purple-500"
            />
          </div>
          <div className="text-white/35 mt-1">Demo visualizer — no mic required</div>
        </div>
      </main>

      <footer className="border-t border-border px-4 py-2 font-mono text-[9px] tracking-wide text-white/35 overflow-x-auto whitespace-nowrap">
        {FOOTER} | DEMO SHELL
      </footer>
    </div>
  )
}

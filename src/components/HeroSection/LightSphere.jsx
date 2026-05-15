import { useRef, useEffect } from 'react'

const SIZE_REST = 740
const SIZE_MOVE = 560

const DEFAULTS = {
  size:           560, //740
  blur:           21,
  blendScreen:    true,
  blobAmp:        33,
  rotSpeedRest:   18,
  rotSpeedMove:   38,
  breatheFreq:    0.85,
  breatheMin:     0.70,
  breatheRange:   0.28,
  pulseFreq:      3.80,
  pulsePx:        7,
  specBlur:       5,     // px — suavidad de las chispas
  specOrbit:      0.54,  // fracción del radio para la órbita
  sparkCount:     5,     // 0-5 chispas activas
  sparkSizeMin:   22,    // px — tamaño mínimo aleatorio
  sparkSizeMax:   30,    // px — tamaño máximo aleatorio
  sparkPeriodMin: 1.50,  // s  — periodo mínimo aleatorio
  sparkPeriodMax: 2.30,  // s  — periodo máximo aleatorio
}

// velocidad y tamaños configurables
const SEED_SIZES   = [0.82, 0.47, 0.65, 0.31, 0.93]  // 5 valores pseudo-aleatorios fijos
const SEED_PERIODS = [0.55, 0.88, 0.22, 0.70, 0.40]

const MAX_SPARKS = 5

// Posición de reposo: pegada a la esquina superior derecha
const getRestPos = (rect) => ({
  x: rect.width  * 0.98,
  y: rect.height * 0.04,
})

const ROW = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }
const LBL = { color: '#aaa', fontSize: 11, width: 130, flexShrink: 0 }
const VAL = { color: '#fff', fontSize: 11, width: 36, textAlign: 'right' }

function Slider({ label, k, cfg, set, min, max, step = 0.01 }) {
  return (
    <div style={ROW}>
      <span style={LBL}>{label}</span>
      <input
        type="range" min={min} max={max} step={step}
        value={cfg[k]}
        onChange={e => set(prev => ({ ...prev, [k]: parseFloat(e.target.value) }))}
        style={{ flex: 1, accentColor: '#dc2626' }}
      />
      <span style={VAL}>{Number(cfg[k]).toFixed(step < 1 ? 2 : 0)}</span>
    </div>
  )
}

function Toggle({ label, k, cfg, set }) {
  return (
    <div style={ROW}>
      <span style={LBL}>{label}</span>
      <input
        type="checkbox" checked={cfg[k]}
        onChange={e => set(prev => ({ ...prev, [k]: e.target.checked }))}
        style={{ accentColor: '#dc2626' }}
      />
    </div>
  )
}

export default function LightSphere({ containerRef, spherePosRef, floatingRef }) {
  const divRef    = useRef()
  const sparkRefs  = [useRef(), useRef(), useRef(), useRef(), useRef()]
  const cfgRef     = useRef(DEFAULTS)

  cfgRef.current = DEFAULTS

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const rest = getRestPos(rect)

    const state = {
      x: rest.x, y: rest.y,
      tx: rest.x, ty: rest.y,
      floating: true, t: 0, angle: 0,
      currentSize: SIZE_REST,
    }

    const onMove = (e) => {
      const r = container.getBoundingClientRect()
      state.tx = e.clientX - r.left
      state.ty = e.clientY - r.top
      state.floating = false
    }
    const onLeave = () => {
      const r    = container.getBoundingClientRect()
      const rest = getRestPos(r)
      state.tx = rest.x
      state.ty = rest.y
      state.floating = true
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)

    let last = performance.now()
    let raf

    const tick = (now) => {
      const c    = cfgRef.current
      const dt   = Math.min((now - last) / 1000, 0.05)
      last = now
      state.t += dt

      if (floatingRef) floatingRef.current = state.floating
      const targetSize = state.floating ? SIZE_REST : SIZE_MOVE
      state.currentSize += (targetSize - state.currentSize) * 0.06
      const HALF = state.currentSize / 2

      const ease = state.floating ? 0.032 : 0.10
      state.x += (state.tx - state.x) * ease
      state.y += (state.ty - state.y) * ease

      state.angle += dt * (state.floating ? c.rotSpeedRest : c.rotSpeedMove)

      const breathe   = (Math.sin(state.t * c.breatheFreq) + 1) / 2
      const baseScale = c.breatheMin + breathe * c.breatheRange
      const opacity   = c.breatheMin + breathe * c.breatheRange * 0.7

      const pulse = 1 + Math.sin(state.t * c.pulseFreq) * (c.pulsePx / HALF)
      const scale = baseScale * pulse

      const br = (freq, phase) =>
        Math.round(Math.max(20, Math.min(80, 50 + Math.sin(state.t * freq + phase) * c.blobAmp)))
      const borderRadius =
        `${br(0.9,0)}% ${br(1.2,1)}% ${br(0.7,2)}% ${br(1.1,3)}% / ${br(1.1,4)}% ${br(0.8,5)}% ${br(1.3,6)}% ${br(0.6,7)}%`
      if (spherePosRef?.current) {
        spherePosRef.current.x = state.x
        spherePosRef.current.y = state.y
      }


      if (divRef.current) {
        const el = divRef.current
        el.style.width        = `${state.currentSize.toFixed(1)}px`
        el.style.height       = `${state.currentSize.toFixed(1)}px`
        el.style.filter       = `blur(${c.blur}px)`
        el.style.mixBlendMode = c.blendScreen ? 'screen' : 'normal'
        el.style.transform    =
          `translate(${state.x - HALF}px, ${state.y - HALF}px) scale(${scale.toFixed(4)}) rotate(${state.angle.toFixed(1)}deg)`
        el.style.opacity      = opacity.toFixed(3)
        el.style.borderRadius = borderRadius
        el.style.boxShadow    = '0 0 50px 15px rgba(220,38,38,0.45)'
      }

      const orbitR     = HALF * c.specOrbit
      sparkRefs.forEach((ref, i) => {
        if (!ref.current) return
        if (i >= c.sparkCount) {
          ref.current.style.opacity = '0'
          return
        }

        const maxSize = c.sparkSizeMin + SEED_SIZES[i]   * (c.sparkSizeMax - c.sparkSizeMin)
        const period  = c.sparkPeriodMin + SEED_PERIODS[i] * (c.sparkPeriodMax - c.sparkPeriodMin)

        const angleOff = (state.angle + (360 / c.sparkCount) * i) * Math.PI / 180
        const sx = state.x + Math.cos(angleOff) * orbitR
        const sy = state.y + Math.sin(angleOff) * orbitR

        const phaseOff = period * (i / MAX_SPARKS)
        const sparkT   = ((state.t + phaseOff) % period) / period  // 0→1

        const sSize  = maxSize * (sparkT * sparkT)
        const sHalf  = sSize / 2

        const whiteRaw  = Math.max(0, (sparkT - 0.78) / 0.12)
        const whiteFade = sparkT > 0.90 ? 1 - (sparkT - 0.90) / 0.10 : 1
        const white     = Math.min(1, whiteRaw) * whiteFade

        const sOpacity = sparkT < 0.88
          ? Math.min(1, sparkT * 1.4)
          : 1 - (sparkT - 0.88) / 0.12

        const rr = 255
        const gg = Math.round(120 + white * 135)  // 120 → 255
        const bb = Math.round(80  + white * 175)  // 80  → 255

        ref.current.style.width      = `${sSize.toFixed(1)}px`
        ref.current.style.height     = `${sSize.toFixed(1)}px`
        ref.current.style.opacity    = Math.max(0, sOpacity).toFixed(3)
        ref.current.style.filter     = `blur(${c.specBlur}px)`
        ref.current.style.background = `radial-gradient(circle,
          rgba(${rr},${gg},${bb},1)   0%,
          rgba(${rr},${gg},${bb},0.5) 45%,
          transparent                  80%
        )`
        ref.current.style.transform  = `translate(${sx - sHalf}px, ${sy - sHalf}px)`
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [containerRef])

  return (
    <>
      <div
        ref={divRef}
        className="sphere-blob"
      />

      {sparkRefs.map((ref, i) => (
        <div
          key={i}
          ref={ref}
          className="sphere-spark"
        />
      ))}

    </>
  )
}


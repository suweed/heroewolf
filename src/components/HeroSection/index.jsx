import { useEffect, useRef, useState } from 'react'
import GridBackground from './GridBackground'
import LightSphere from './LightSphere'
import HeroGridCube from './HeroGridCube'

const BADGES = [
  'Adobe Gold Partner certificado',
  '+10 años de experiencia',
  'Experience Cloud completo',
  'Clientes en todo LATAM',
]

const CIRCLE_RADIUS_REST = 185
const CIRCLE_RADIUS_MOVE = 165

// ── Grid: dimensíones del plano Three.js y número de celdas (sync con GridBackground) ──
const GRID_COLS = 30
const GRID_ROWS = 19
const GRID_W    = 16   // unidades Three.js (planeGeometry x)
const GRID_H    = 10   // unidades Three.js (planeGeometry y)
const CUBE_GS   = 0.232  // escala del cubo dentro del grid
const CUBE_GZ   = 0.255  // profundidad Z fija

// Offsets de posición de los cubos dentro de sus celdas (ajusta aquí para mover)
const CUBE_OFFSET_X = -0.008  // desplazamiento horizontal
const CUBE_OFFSET_Y =  0.011  // desplazamiento vertical

/** Convierte coordenadas de celda (0-indexed) al centro en world space */
function cellToWorld(col, row) {
  return {
    gx: -(GRID_W / 2) + (col + 0.5) * (GRID_W / GRID_COLS) + CUBE_OFFSET_X,
    gy:  (GRID_H / 2) - (row + 0.5) * (GRID_H / GRID_ROWS) + CUBE_OFFSET_Y,
    gz: CUBE_GZ,
    gs: CUBE_GS,
    rx: 0, ry: 0, rz: 0,
  }
}

const AUTO_OPEN_MS = 4200
const AUTO_GAP_MS = 1400

const cubeKey = (cfg) => `cube-${cfg.col}-${cfg.row}`

function shuffle(items) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// ── Configuración de cubos en el grid ──
//  col / row       : celda (0-indexed) donde aparece el cubo
//  interiorColor   : color de las paredes internas de la caja
//  sphereBgColor   : color de fondo de la esfera
//  iconUrl         : ruta de la imagen del logo (relativa a /public/)
//  iconWidth       : ancho del icono relativo al diámetro de la esfera (0.0–1.0)
//  iconHeight      : alto del icono relativo al diámetro de la esfera (0.0–1.0)
//  sph             : posición de reposo (sx/sy/sz) y rotación del logo (rox/roy/roz)
//  openDir         : dirección en que se abre la tapa ('top' | 'bottom' | 'left' | 'right')
const CUBE_CONFIGS = [
  {
    col: 5, row: 5,
    interiorColor: '#f8a710',
    sphereBgColor: '#000000',
    iconUrl: '/images/js.png',
    iconWidth: 0.25,
    iconHeight: 0.35,
    openDir: 'left',
    sph: { sx: 0, sy: 0, sz: 0, rox: -0.041, roy: -1.595, roz: -0.082 },
    lgt: { amb: 0.200, dirX: 1.231, dirY: 1.231, dirZ: 2.769, dirI: 1.131, ptI: 0.000, emi: 0.262, iMax: 0.385 },
  },
  {
    col: 21, row: 7,
    interiorColor: '#3676ee',
    sphereBgColor: '#000000',
    iconUrl: '/images/php.png',
    iconWidth: 0.30,
    iconHeight: 0.55,
    openDir: 'left',
    sph: { sx: 0, sy: 0, sz: 0, rox: -0.041, roy: -1.595, roz: -0.082 },
    lgt: { amb: 0.200, dirX: 1.231, dirY: 1.231, dirZ: 2.769, dirI: 1.131, ptI: 0.000, emi: 0.262, iMax: 0.260 },
  },
  {
    col: 6, row: 9,
    interiorColor: '#f7803b',
    sphereBgColor: '#f7f7f7',
    iconUrl: '/images/magento.png',
    iconWidth: 0.35,
    iconHeight: 0.45,
    openDir: 'right',
    sph: { sx: 0, sy: 0, sz: 0, rox: -0.041, roy: -1.595, roz: -0.082 },
    lgt: { amb: 0.200, dirX: -1.231, dirY: -1.231, dirZ: 2.769, dirI: 1.131, ptI: 0.000, emi: 0.262, iMax: 0.000 },
  },
  {
    col: 19, row: 13,
    interiorColor: '#578ff8',
    sphereBgColor: '#ffffff',
    iconUrl: '/images/mysql.png',
    iconWidth: 0.35,
    iconHeight: 0.55,
    openDir: 'bottom',
    sph: { sx: 0, sy: 0, sz: 0, rox: -0.041, roy: -1.595, roz: -0.082 },
    lgt: { amb: 0.200, dirX: 1.231, dirY: 1.231, dirZ: 2.769, dirI: 1.131, ptI: 0.000, emi: 0.262, iMax: 0.385 },
  },
  {
    col: 16, row: 5,
    interiorColor: '#88860d',
    sphereBgColor: '#000000',
    iconUrl: '/images/python.png',
    iconWidth: 0.25,
    iconHeight: 0.40,
    openDir: 'top',
    sph: { sx: 0, sy: 0, sz: 0, rox: -0.041, roy: -1.595, roz: -0.082 },
    lgt: { amb: 0.200, dirX: -1.231, dirY: -1.231, dirZ: 2.769, dirI: 1.131, ptI: 0.000, emi: 0.262, iMax: 0.385 },
  },
  {
    col: 4, row: 12,
    interiorColor: '#32c3e7',
    sphereBgColor: '#000000',
    iconUrl: '/images/react.png',
    iconWidth: 0.30,
    iconHeight: 0.40,
    openDir: 'bottom',
    sph: { sx: 0, sy: 0, sz: 0, rox: -0.041, roy: -1.595, roz: -0.082 },
    lgt: { amb: 0.200, dirX: 1.231, dirY: 1.231, dirZ: 2.769, dirI: 1.131, ptI: 0.000, emi: 0.262, iMax: 0.385 },
  },
  {
    col: 24, row: 11,
    interiorColor: '#19753c',
    sphereBgColor: '#ffffff',
    iconUrl: '/images/aws.png',
    iconWidth: 0.25,
    iconHeight: 0.40,
    openDir: 'top',
    sph: { sx: 0, sy: 0, sz: 0, rox: 0.099, roy: -1.595, roz: -0.082 },
    lgt: { amb: 0.200, dirX: -1.231, dirY: -1.231, dirZ: 2.769, dirI: 1.131, ptI: 0.000, emi: 0.262, iMax: 0.385 },
  },
]

export default function HeroSection() {
  const containerRef = useRef()
  const spherePosRef = useRef({ x: 0, y: 0 })
  const floatingRef  = useRef(true)
  const [autoOpenKey, setAutoOpenKey] = useState(null)
  const [manualOpenMap, setManualOpenMap] = useState({})

  useEffect(() => {
    const keys = CUBE_CONFIGS.map(cubeKey)
    let cancelled = false
    let stepTimeout = null
    let closeTimeout = null
    let order = shuffle(keys)
    let index = 0

    const clearCurrent = () => {
      if (closeTimeout) clearTimeout(closeTimeout)
      if (stepTimeout) clearTimeout(stepTimeout)
    }

    const next = () => {
      if (cancelled) return

      if (index >= order.length) {
        order = shuffle(keys)
        index = 0
      }

      const key = order[index]
      setAutoOpenKey(key)

      closeTimeout = setTimeout(() => {
        if (cancelled) return
        setAutoOpenKey(null)
        index += 1
        stepTimeout = setTimeout(next, AUTO_GAP_MS)
      }, AUTO_OPEN_MS)
    }

    next()

    return () => {
      cancelled = true
      clearCurrent()
    }
  }, [])

  function toggleManualOpen(key) {
    setManualOpenMap(prev => {
      const next = { ...prev }
      // Si está abierta manualmente, ciérrala (elimina del map)
      // Si no está en el map, abre manualmente
      if (next[key]) {
        delete next[key]
      } else {
        next[key] = true
      }
      return next
    })
  }

  return (
    <section ref={containerRef} className="hero-section">
      {/* ── LAYER 3: Esfera de luz roja ── */}
      <LightSphere containerRef={containerRef} spherePosRef={spherePosRef} floatingRef={floatingRef} />

      {/* ── LAYER 2: Cuadrícula 3D ── */}
      <GridBackground spherePosRef={spherePosRef} floatingRef={floatingRef} circleRadiusRest={CIRCLE_RADIUS_REST} circleRadiusMove={CIRCLE_RADIUS_MOVE}>
        {CUBE_CONFIGS.map((cfg) => (
          <HeroGridCube
            key={cubeKey(cfg)}
            dbg={cellToWorld(cfg.col, cfg.row)}
            sphDbg={cfg.sph}
            lgtDbg={cfg.lgt}
            iconWidth={cfg.iconWidth}
            iconHeight={cfg.iconHeight}
            openDir={cfg.openDir}
            interiorColor={cfg.interiorColor}
            sphereBgColor={cfg.sphereBgColor}
            iconUrl={cfg.iconUrl}
            isOpen={manualOpenMap[cubeKey(cfg)] === true ? true : (autoOpenKey === cubeKey(cfg))}
            onToggleOpen={() => toggleManualOpen(cubeKey(cfg))}
          />
        ))}
      </GridBackground>

      <div className="hero-text">
        <p className="hero-eyebrow">
          Adobe Experience Cloud Partner · México
        </p>

        <h1 className="hero-title">
          Creamos experiencias
          <br />
          disruptivas para
          <br />
          <span className="hero-title-accent">Commerce</span> &amp; CX.
        </h1>

        <p className="hero-description">
          Implementamos{' '}
          <strong>Adobe Experience Cloud completo</strong>
          : Commerce, Experience Manager (AEM), Experience Platform, Target,
          Marketo, Journey Optimizer y Workfront. Un solo partner certificado
          para toda tu stack digital.
        </p>

        <div className="hero-actions">
          <button className="hero-btn-primary">Agendar una llamada</button>
          <button className="hero-btn-secondary">Ver servicios</button>
        </div>

        <div className="hero-badges">
          {BADGES.map((item) => (
            <div key={item} className="hero-badge">
              <span className="hero-badge-check">✓</span>
              {item}
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}


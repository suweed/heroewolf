import { useRef } from 'react'
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

// Posición final del cubo en celda (col=5, row=5 · 0-indexed)
const CUBE_CELL = { gx: -5.074, gy: 2.112, gz: 0.255, gs: 0.232, rx: 0, ry: 0, rz: 0 }

// Esfera dentro de la caja — valores confirmados
const CUBE_SPH = { sx: 0, sy: 0, sz: 0, rox: -0.041, roy: -1.595, roz: -0.082 }

// Iluminación del cubo — valores confirmados
const CUBE_LGT = { amb: 0.383, dirX: -2.187, dirY: 2.338, dirZ: 15.000, dirI: 0.918, ptI: 1.636, emi: 0.212, iMax: 0.000 }

export default function HeroSection() {
  const containerRef = useRef()
  const spherePosRef = useRef({ x: 0, y: 0 })
  const floatingRef  = useRef(true)

  return (
    <section ref={containerRef} className="hero-section">
      {/* ── LAYER 3: Esfera de luz roja ── */}
      <LightSphere containerRef={containerRef} spherePosRef={spherePosRef} floatingRef={floatingRef} />

      {/* ── LAYER 2: Cuadrícula 3D ── */}
      <GridBackground spherePosRef={spherePosRef} floatingRef={floatingRef} circleRadiusRest={CIRCLE_RADIUS_REST} circleRadiusMove={CIRCLE_RADIUS_MOVE}>
        <HeroGridCube dbg={CUBE_CELL} sphDbg={CUBE_SPH} lgtDbg={CUBE_LGT} />
      </GridBackground>

      {/* ── LAYER 1: Texto ── */}
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


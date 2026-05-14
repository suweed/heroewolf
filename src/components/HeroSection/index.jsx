import { useRef } from 'react'
import GridBackground from './GridBackground'
import LightSphere from './LightSphere'

const BADGES = [
  'Adobe Gold Partner certificado',
  '+10 años de experiencia',
  'Experience Cloud completo',
  'Clientes en todo LATAM',
]

const CIRCLE_RADIUS = 165   // radio del tracker circle

export default function HeroSection() {
  const containerRef = useRef()
  const spherePosRef = useRef({ x: 0, y: 0 })

  return (
    <section ref={containerRef} className="hero-section">
      {/* ── LAYER 3: Esfera de luz roja ── */}
      <LightSphere containerRef={containerRef} spherePosRef={spherePosRef} />

      {/* ── LAYER 2: Cuadrícula 3D ── */}
      <GridBackground spherePosRef={spherePosRef} circleRadius={CIRCLE_RADIUS} />

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


import { useMemo, useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// 2 * tan(fov/2) * distancia = 2 * tan(30°) * 5 ≈ 5.774
const ORTHO_TARGET_H = 2 * Math.tan(Math.PI / 6) * 5

function CameraSync() {
  const { camera, size } = useThree()
  useEffect(() => {
    camera.zoom = size.height / ORTHO_TARGET_H
    camera.updateProjectionMatrix()
  }, [camera, size.height])
  return null
}

function makeGridTexture() {
  const cellSize = 64
  const gap = 2
  const canvas = document.createElement('canvas')
  canvas.width = cellSize
  canvas.height = cellSize
  const ctx = canvas.getContext('2d')

  // Gap: completamente transparente — toda la luz pasa por aquí
  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, cellSize, cellSize)

  // Celda: negro 100% opaco — bloquea la luz completamente
  ctx.fillStyle = 'rgba(10, 10, 10, 1)'
  ctx.fillRect(0, 0, cellSize - gap, cellSize - gap)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  tex.repeat.set(30, 19)
  return tex
}


const RADIUS_REST = 245
const RADIUS_MOVE = 165

const GRID_DEFAULTS = {
  radius:      245,   // px — tamaño del círculo (reposo)
  blurPx:       52,   // px — blur del overlay ahumado
  smokeDark:   0.73,  // 0-1 — oscuridad máxima en el centro
  transCenter: 0.48,  // 0-1 — opacidad del mask en el centro (menor = más transparente)
  morphAmp:    0.11,  // 0-0.35 — amplitud de deformación de la elipse
  morphSpeed:  0.65,  // 0.1-4  — velocidad de animación de forma
  centerDrift: 0.07,  // 0-0.20 — cuánto se desplaza el centro
}

function GridMesh() {
  const texture = useMemo(() => makeGridTexture(), [])

  return (
    <mesh>
      <planeGeometry args={[16, 10]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  )
}


export default function GridBackground({ spherePosRef, floatingRef, circleRadiusRest, circleRadiusMove, children }) {
  const wrapperRef = useRef()
  const overlayRef = useRef()
  const cfgRef     = useRef(GRID_DEFAULTS)

  useEffect(() => {
    if (!spherePosRef) return
    let raf
    let t = 0
    let last = performance.now()
    let currentRadius = circleRadiusRest ?? RADIUS_REST

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      t += dt

      const { x, y } = spherePosRef.current
      const c  = cfgRef.current
      const restR = circleRadiusRest ?? RADIUS_REST
      const moveR = circleRadiusMove ?? RADIUS_MOVE
      const targetR = (floatingRef?.current !== false) ? restR : moveR
      currentRadius += (targetR - currentRadius) * 0.06
      const r = currentRadius
      const sp = c.morphSpeed

      if (wrapperRef.current) {
        const rx = (r * (1 + Math.sin(t * 0.71 * sp) * c.morphAmp + Math.sin(t * 1.30 * sp) * c.morphAmp * 0.5)).toFixed(1)
        const ry = (r * (1 + Math.cos(t * 0.59 * sp) * c.morphAmp + Math.cos(t * 1.10 * sp) * c.morphAmp * 0.5)).toFixed(1)
        const ox = (Math.sin(t * 0.43 * sp) * r * c.centerDrift).toFixed(1)
        const oy = (Math.cos(t * 0.61 * sp) * r * c.centerDrift).toFixed(1)
        const cx = (parseFloat(x) + parseFloat(ox)).toFixed(1)
        const cy = (parseFloat(y) + parseFloat(oy)).toFixed(1)

        const tc   = c.transCenter
        const tcMid = Math.min(tc + 0.05, 1).toFixed(2)
        const tcOut = Math.min(tc + 0.30, 1).toFixed(2)
        const mask = `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px,
          rgba(255,255,255,${tc.toFixed(2)}) 0%,
          rgba(255,255,255,${tcMid})         30%,
          rgba(255,255,255,${tcOut})         60%,
          rgba(255,255,255,1.00)             85%,
          white                              100%)`
        wrapperRef.current.style.maskImage       = mask
        wrapperRef.current.style.webkitMaskImage = mask

        if (overlayRef.current) {
          const sd = c.smokeDark
          overlayRef.current.style.background = `radial-gradient(ellipse ${rx}px ${ry}px at ${cx}px ${cy}px,
            rgba(10,10,10,${sd.toFixed(2)})              0%,
            rgba(10,10,10,${(sd * 0.80).toFixed(2)})     30%,
            rgba(10,10,10,${(sd * 0.31).toFixed(2)})     62%,
            rgba(10,10,10,0.00)                          82%,
            transparent                                  100%)`
          overlayRef.current.style.filter = `blur(${c.blurPx}px)`
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [spherePosRef, floatingRef])

  return (
    <>
      <div ref={wrapperRef} className="grid-wrapper">
        <Canvas
          className="grid-canvas"
          style={{ width: '100%', height: '100%', display: 'block' }}
          orthographic
          camera={{ position: [0, 0, 5], zoom: 100, near: 0.1, far: 100 }}
          onCreated={({ camera, size }) => {
            camera.zoom = size.height / ORTHO_TARGET_H
            camera.updateProjectionMatrix()
          }}
          gl={{ antialias: true, alpha: true }}
        >
          <CameraSync />
          <GridMesh />
        </Canvas>
      </div>

      {children && (
        <div className="cube-wrapper">
          <Canvas
            shadows
            style={{ width: '100%', height: '100%', display: 'block' }}
            orthographic
            camera={{ position: [0, 0, 5], zoom: 100, near: 0.1, far: 100 }}
            onCreated={({ camera, size }) => {
              camera.zoom = size.height / ORTHO_TARGET_H
              camera.updateProjectionMatrix()
            }}
            gl={{ antialias: true, alpha: true }}
          >
            <CameraSync />
            {children}
          </Canvas>
        </div>
      )}

      <div ref={overlayRef} className="grid-overlay" />
    </>
  )
}


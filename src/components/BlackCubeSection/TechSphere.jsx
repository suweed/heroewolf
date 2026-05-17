import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SPHERE_RADIUS = 0.77
const HALF_BOX     = 1.1
const BOUNDS       = HALF_BOX - SPHERE_RADIUS  // 0.33
const GRAVITY_MAG  = 9.0
const RESTITUTION  = 0.60
const DAMPING      = 0.982
const CLICK_SPEED  = 5.0
const OPEN_IMPACT_SPEED = 3.0

const LOCAL_GRAV = new THREE.Vector3(0, 0, -1)

const ICON_URL   = '/images/jslogo.png'
const BG_COLOR   = '#000000'
const ICON_SCALE = 0.25

function clamp01(v, fallback = ICON_SCALE) {
  if (typeof v !== 'number' || Number.isNaN(v)) return fallback
  return Math.min(1, Math.max(0, v))
}

function buildTexture(img, bgColor = BG_COLOR, iconWidth = ICON_SCALE, iconHeight = ICON_SCALE) {
  const S = 512
  const canvas = document.createElement('canvas')
  canvas.width = S; canvas.height = S
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, S, S)
  if (img) {
    const w = S * clamp01(iconWidth)
    const h = S * clamp01(iconHeight)
    const x = (S - w) / 2
    const y = (S - h) / 2
    ctx.drawImage(img, x, y, w, h)
  }
  return new THREE.CanvasTexture(canvas)
}

function useIconTexture(url = ICON_URL, bgColor = BG_COLOR, iconWidth = ICON_SCALE, iconHeight = ICON_SCALE) {
  const [texture, setTexture] = useState(() => buildTexture(null, bgColor, iconWidth, iconHeight))

  useEffect(() => {
    // Si no hay URL, solo muestra el color de fondo
    if (!url) {
      setTexture(buildTexture(null, bgColor, iconWidth, iconHeight))
      return
    }
    const img = new Image()
    img.onload  = () => setTexture(buildTexture(img, bgColor, iconWidth, iconHeight))
    img.onerror = () => console.warn('[TechSphere] imagen no encontrada:', url)
    img.src = url
  }, [url, bgColor, iconWidth, iconHeight])

  return texture
}

const TechSphere = forwardRef(function TechSphere({ isOpen, rotation = { x: 0, y: 0, z: 0 }, iconUrl, iconWidth = ICON_SCALE, iconHeight = ICON_SCALE, bgColor, restPos = { x: 0, y: 0, z: 0 } }, ref) {
  const meshRef    = useRef()
  const posRef     = useRef(new THREE.Vector3(0, 0, 0))
  const velRef     = useRef(new THREE.Vector3(0, 0, 0))
  const wasOpenRef = useRef(false)
  const isOpenRef  = useRef(isOpen)
  isOpenRef.current = isOpen
  const texture    = useIconTexture(iconUrl, bgColor, iconWidth, iconHeight)

  useImperativeHandle(ref, () => ({
    kick() {
      if (!isOpenRef.current) return
      velRef.current.set(
        -(Math.random() - 0.5) * CLICK_SPEED * 2,
        -(Math.random() - 0.5) * CLICK_SPEED * 2,
        +(Math.random() * CLICK_SPEED + 1.5)  // impulso hacia arriba
      )
    },
    getMesh() { return meshRef.current }
  }), [])

  useFrame((_, delta) => {
    if (!meshRef.current) return

    if (isOpen && !wasOpenRef.current) {
      posRef.current.set(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        +BOUNDS
      )
      velRef.current.set(
        (Math.random() - 0.5) * 1.4,
        (Math.random() - 0.5) * 1.4,
        -(OPEN_IMPACT_SPEED + Math.random() * 1.2) // impacto más fuerte hacia el fondo al abrir
      )
    }
    wasOpenRef.current = isOpen

    if (!isOpen) {
      posRef.current.lerp(new THREE.Vector3(restPos.x, restPos.y, restPos.z), 0.08)
      velRef.current.set(0, 0, 0)
      meshRef.current.position.copy(posRef.current)
      return
    }

    velRef.current.addScaledVector(LOCAL_GRAV, GRAVITY_MAG * delta)
    velRef.current.multiplyScalar(DAMPING)

    posRef.current.x += velRef.current.x * delta
    posRef.current.y += velRef.current.y * delta
    posRef.current.z += velRef.current.z * delta

    const b = BOUNDS
    if (posRef.current.x >  b) { posRef.current.x =  b; velRef.current.x *= -RESTITUTION }
    if (posRef.current.x < -b) { posRef.current.x = -b; velRef.current.x *= -RESTITUTION }
    if (posRef.current.y >  b) { posRef.current.y =  b; velRef.current.y *= -RESTITUTION }
    if (posRef.current.y < -b) { posRef.current.y = -b; velRef.current.y *= -RESTITUTION }
    // Suelo local (-Z): rebote
    if (posRef.current.z < -b) { posRef.current.z = -b; velRef.current.z =  Math.abs(velRef.current.z) * RESTITUTION }
    // Techo local (+Z): rebote
    if (posRef.current.z >  b) { posRef.current.z =  b; velRef.current.z *= -RESTITUTION }

    meshRef.current.position.copy(posRef.current)
  })

  return (
    <mesh
      ref={meshRef}
      rotation={[rotation.x, rotation.y, rotation.z]}
      onClick={(e) => {
        if (!isOpenRef.current) return
        e.stopPropagation()
        velRef.current.set(
          -(Math.random() - 0.5) * CLICK_SPEED * 2,
          -(Math.random() - 0.5) * CLICK_SPEED * 2,
          +(Math.random() * CLICK_SPEED + 1.5)
        )
      }}
    >
      <sphereGeometry args={[SPHERE_RADIUS, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={0.3} metalness={0.05} />
    </mesh>
  )
})

export default TechSphere

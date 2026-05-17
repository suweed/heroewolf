import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import TechSphere from './TechSphere'

const SIZE = 2.2
const HALF = SIZE / 2

// Rotación fija de la caja: tapa (y+) apuntando hacia la cámara (z+)
const BOX_ROTATION = [-0.27, 0, 0]

// Configuración de bisagra por dirección de apertura
// hingePos : posición del pivot (borde de la cara frontal)
// facePos  : posición del centro de la tapa relativa al pivot
// axis     : eje de rotación de la animación ('x' | 'y')
// target   : ángulo final al abrir (±Math.PI)
const LID_DIR = {
  top:    { hingePos: [0,     HALF,  HALF], facePos: [0,     -HALF, 0], axis: 'x', target: -Math.PI },
  bottom: { hingePos: [0,    -HALF,  HALF], facePos: [0,      HALF, 0], axis: 'x', target:  Math.PI },
  left:   { hingePos: [-HALF, 0,     HALF], facePos: [ HALF,  0,    0], axis: 'y', target: -Math.PI },
  right:  { hingePos: [ HALF, 0,     HALF], facePos: [-HALF,  0,    0], axis: 'y', target:  Math.PI },
}

// Color del interior de la caja
const INTERIOR_COLOR = '#f8a710'

function BoxFace({ position, rotation, interiorColor = INTERIOR_COLOR, boxColor = '#010101', flipInterior = true, emissiveIntensity = 0.06 }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Cara exterior */}
      <mesh position={[0, 0, 0.001]} castShadow receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial
          color={boxColor}
          metalness={0.9}
          roughness={0.15}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* Cara interior — BackSide para normales correctas hacia adentro */}
      {/* Interior: rotamos la geometría 180° para asegurar que mira siempre hacia el interior */}
      <mesh position={[0, 0, -0.001]} rotation={flipInterior ? [Math.PI, 0, 0] : [0, 0, 0]} castShadow receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial
          color={interiorColor}
          emissive={interiorColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.85}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
    )
}

  export default function BlackBox({ sphereRot, sphereRestPos = { x: 0, y: 0, z: 0 }, interiorColor = INTERIOR_COLOR, iconUrl, iconWidth, iconHeight, bgColor, boxRotation, boxColor = '#010101', dbg, setDbg, emissiveIntensity = 0.06, interiorLightMax = 2, openDir = 'top', isOpen, onToggleOpen }) {
  const [localOpen, setLocalOpen] = useState(false)
  const lidGroupRef      = useRef()
  const interiorLightRef = useRef()
  const sphereRef        = useRef()
  const controlledOpen = typeof isOpen === 'boolean'
  const open = controlledOpen ? isOpen : localOpen

  // dbg can be passed from parent to show external DebugPanel; otherwise use local state
  const defaultDbg = {
    rx: boxRotation?.[0] ?? BOX_ROTATION[0],
    ry: boxRotation?.[1] ?? BOX_ROTATION[1],
    rz: boxRotation?.[2] ?? BOX_ROTATION[2],
    px: 0, py: 0, pz: 0,
    sx: 1, sy: 1, sz: 1,
    boxColor: boxColor,
  }
  const [localDbg, setLocalDbg] = useState(defaultDbg)
  const dbgState = dbg ?? localDbg
  const setDbgState = setDbg ?? setLocalDbg

  useFrame(() => {
    if (!lidGroupRef.current) return
    const { axis, target: openTarget } = LID_DIR[openDir] ?? LID_DIR.top
    lidGroupRef.current.rotation[axis] = THREE.MathUtils.lerp(
      lidGroupRef.current.rotation[axis],
      open ? openTarget : 0,
      0.07
    )
    if (interiorLightRef.current) {
      const lightTarget = open ? interiorLightMax : 0
      interiorLightRef.current.intensity = THREE.MathUtils.lerp(
        interiorLightRef.current.intensity,
        lightTarget,
        0.06
      )
    }
  })

  return (
    <>
      <group
      rotation={[dbgState.rx, dbgState.ry, dbgState.rz]}
      position={[dbgState.px, dbgState.py, dbgState.pz]}
      scale={[dbgState.sx, dbgState.sy, dbgState.sz]}
      onClick={(e) => {
        e.stopPropagation()
        if (onToggleOpen) {
          onToggleOpen()
          return
        }
        if (!controlledOpen) setLocalOpen((o) => !o)
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* Luz interior suave — se enciende al abrir/cerrar */}
      <pointLight ref={interiorLightRef} position={[0, 0, 0]} intensity={0} color={interiorColor} distance={5} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0005} />

      {/* Cara trasera */}
      <BoxFace position={[0, 0, -HALF]} rotation={[0, Math.PI, 0]} interiorColor={interiorColor} boxColor={dbgState.boxColor} emissiveIntensity={emissiveIntensity} />
      {/* Cara inferior */}
      <BoxFace position={[0, -HALF, 0]} rotation={[Math.PI / 2, 0, 0]} interiorColor={interiorColor} boxColor={dbgState.boxColor} emissiveIntensity={emissiveIntensity} />
      {/* Cara superior */}
      <BoxFace position={[0, HALF, 0]} rotation={[-Math.PI / 2, 0, 0]} interiorColor={interiorColor} boxColor={dbgState.boxColor} emissiveIntensity={emissiveIntensity} />
      {/* (La cara frontal ahora será la tapa; la añadimos como grupo con bisagra abajo) */}
      {/* Cara izquierda */}
      <BoxFace position={[-HALF, 0, 0]} rotation={[0, -Math.PI / 2, 0]} interiorColor={interiorColor} boxColor={dbgState.boxColor} emissiveIntensity={emissiveIntensity} />
      {/* Cara derecha */}
      <BoxFace position={[HALF, 0, 0]} rotation={[0, Math.PI / 2, 0]} interiorColor={interiorColor} boxColor={dbgState.boxColor} emissiveIntensity={emissiveIntensity} />

      {/* Tapa frontal — bisagra configurable según openDir ('top'|'bottom'|'left'|'right') */}
      <group ref={lidGroupRef} position={LID_DIR[openDir]?.hingePos ?? LID_DIR.top.hingePos}>
        <BoxFace position={LID_DIR[openDir]?.facePos ?? LID_DIR.top.facePos} rotation={[0, 0, 0]} interiorColor={interiorColor} boxColor={dbgState.boxColor} flipInterior={false} emissiveIntensity={emissiveIntensity} />
      </group>

      {/* Esfera de tecnologías — 70% del interior de la caja */}
      <TechSphere ref={sphereRef} isOpen={open} rotation={sphereRot} restPos={sphereRestPos} iconUrl={iconUrl} iconWidth={iconWidth} iconHeight={iconHeight} bgColor={bgColor} />
    </group>
    </>
  )
}

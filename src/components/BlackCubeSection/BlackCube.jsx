import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import TechSphere from './TechSphere'

const SIZE = 2.2
const HALF = SIZE / 2

// Rotación fija de la caja: tapa (y+) apuntando hacia la cámara (z+)
const BOX_ROTATION = [-0.27, 0, 0]

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

export default function BlackBox({ sphereRot, sphereRestPos = { x: 0, y: 0, z: 0 }, interiorColor = INTERIOR_COLOR, iconUrl, bgColor, boxRotation, boxColor = '#010101', dbg, setDbg, emissiveIntensity = 0.06, interiorLightMax = 2 }) {
  const [open, setOpen] = useState(false)
  const lidGroupRef      = useRef()
  const interiorLightRef = useRef()
  const sphereRef        = useRef()

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
    const target = open ? -Math.PI : 0
    lidGroupRef.current.rotation.x = THREE.MathUtils.lerp(
      lidGroupRef.current.rotation.x,
      target,
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
        setOpen((o) => !o)
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* Luz interior suave — se enciende al abrir */}
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

      {/* Tapa frontal — bisagra en el borde superior de la cara frontal (eje X) */}
      {/* El grupo está situado en el borde superior de la cara frontal: [0, HALF, HALF].
          La cara se coloca con su centro desplazado hacia abajo (-HALF) respecto a la bisagra,
          de modo que la rotación en X abra la tapa hacia arriba. */}
      <group ref={lidGroupRef} position={[0, HALF, HALF]}>
        <BoxFace position={[0, -HALF, 0]} rotation={[0, 0, 0]} interiorColor={interiorColor} boxColor={dbgState.boxColor} flipInterior={false} emissiveIntensity={emissiveIntensity} />
      </group>

      {/* Esfera de tecnologías — 70% del interior de la caja */}
      <TechSphere ref={sphereRef} isOpen={open} rotation={sphereRot} restPos={sphereRestPos} iconUrl={iconUrl} bgColor={bgColor} />
    </group>
    </>
  )
}

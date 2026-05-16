import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import BlackBox from '../BlackCubeSection/BlackCube'

// lgtDbg: { amb, dirX, dirY, dirZ, dirI, ptI, emi, iMax }
// dirX/Y/Z son factores de offset en unidades de escala del cubo (se multiplican por gs)
const LGT_DEFAULT = { amb: 0.22, dirX: 5, dirY: 7, dirZ: 5, dirI: 1.1, ptI: 0.9, emi: 0.06, iMax: 2 }

// Luces en world space para que las sombras y el shading no se vean afectados por el scale del cubo
function SceneLights({ gx, gy, gz, gs, lgtDbg }) {
  const lightRef = useRef()
  const { scene } = useThree()

  const lx = gx + lgtDbg.dirX * gs
  const ly = gy + lgtDbg.dirY * gs
  const lz = gz + lgtDbg.dirZ * gs
  const frustum = gs * 1.8  // cubre la caja (SIZE=2.2 * gs) con margen

  useEffect(() => {
    const light = lightRef.current
    if (!light) return
    light.target.position.set(gx, gy, gz)
    scene.add(light.target)
    light.target.updateMatrixWorld()
    return () => { scene.remove(light.target) }
  }, [gx, gy, gz, scene])

  return (
    <>
      <ambientLight intensity={lgtDbg.amb} />
      <directionalLight
        ref={lightRef}
        position={[lx, ly, lz]}
        intensity={lgtDbg.dirI}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.01}
        shadow-camera-far={gs * 30}
        shadow-camera-left={-frustum}
        shadow-camera-right={frustum}
        shadow-camera-top={frustum}
        shadow-camera-bottom={-frustum}
        shadow-bias={-0.0008}
      />
      <pointLight
        position={[gx - 4 * gs, gy - 4 * gs, gz + 4 * gs]}
        intensity={lgtDbg.ptI}
        color="#ffffff"
      />
    </>
  )
}

// dbg     = { gx, gy, gz, gs, rx, ry, rz }                   — posición/rotación del grupo en el grid
// sphDbg  = { sx, sy, sz, rox, roy, roz }                     — posición de reposo y rotación de la esfera
// lgtDbg  = { amb, dirX, dirY, dirZ, dirI, ptI, emi, iMax }   — intensidades de luz / sombras
export default function HeroGridCube({
  dbg,
  sphDbg = { sx: 0, sy: 0, sz: 0, rox: 0, roy: 0, roz: 0 },
  lgtDbg = LGT_DEFAULT,
}) {
  const { gx, gy, gz, gs, rx, ry, rz } = dbg
  const boxDbg = {
    rx, ry, rz,
    px: 0, py: 0, pz: 0,
    sx: 1, sy: 1, sz: 1,
    boxColor: '#010101',
  }

  return (
    <>
      <SceneLights gx={gx} gy={gy} gz={gz} gs={gs} lgtDbg={lgtDbg} />
      <group position={[gx, gy, gz]} scale={gs}>
        <BlackBox
          dbg={boxDbg}
          sphereRot={{ x: sphDbg.rox, y: sphDbg.roy, z: sphDbg.roz }}
          sphereRestPos={{ x: sphDbg.sx, y: sphDbg.sy, z: sphDbg.sz }}
          emissiveIntensity={lgtDbg.emi}
          interiorLightMax={lgtDbg.iMax}
        />
      </group>
    </>
  )
}

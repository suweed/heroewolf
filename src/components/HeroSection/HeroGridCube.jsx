import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import BlackBox from '../BlackCubeSection/BlackCube'

const LGT_DEFAULT = {
  amb: 0.22,
  dirX: 2.5,
  dirY: 3.5,
  dirZ: 2.5,
  dirI: 1.1,
  ptI: 0.9,
  emi: 0.06,
  iMax: 2,
}

function SceneLights({ gx, gy, gz, gs, lgt }) {
  const spotRef = useRef()
  const { scene } = useThree()

  const lx = gx + lgt.dirX * gs
  const ly = gy + lgt.dirY * gs
  const lz = gz + lgt.dirZ * gs

  useEffect(() => {
    const spot = spotRef.current
    if (!spot) return
    spot.target.position.set(gx, gy, gz)
    scene.add(spot.target)
    spot.target.updateMatrixWorld()
    return () => { scene.remove(spot.target) }
  }, [gx, gy, gz, scene])

  return (
    <>
      <pointLight
        position={[gx + 4 * gs, gy + 4 * gs, gz + 6 * gs]}
        intensity={lgt.ptI}
        distance={30 * gs}
      />
      <spotLight
        ref={spotRef}
        position={[lx, ly, lz]}
        intensity={lgt.dirI}
        angle={0.55}
        penumbra={0.35}
        distance={40 * gs}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.05}
        shadow-camera-far={60 * gs}
        shadow-bias={-0.0008}
      />
      <pointLight
        position={[gx - 2 * gs, gy - 2 * gs, gz + 4 * gs]}
        intensity={lgt.amb}
        distance={20 * gs}
      />
    </>
  )
}

export default function HeroGridCube({
  dbg,
  sphDbg = { sx: 0, sy: 0, sz: 0, rox: 0, roy: 0, roz: 0 },
  lgtDbg = LGT_DEFAULT,
  interiorColor,
  sphereBgColor,
  iconUrl,
  iconWidth,
  iconHeight,
  openDir = 'top',
  isOpen,
  onToggleOpen,
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
      <SceneLights gx={gx} gy={gy} gz={gz} gs={gs} lgt={lgtDbg} />
      <group position={[gx, gy, gz]} scale={gs}>
        <BlackBox
          dbg={boxDbg}
          sphereRot={{ x: sphDbg.rox, y: sphDbg.roy, z: sphDbg.roz }}
          sphereRestPos={{ x: sphDbg.sx, y: sphDbg.sy, z: sphDbg.sz }}
          interiorColor={interiorColor}
          bgColor={sphereBgColor}
          iconUrl={iconUrl}
          iconWidth={iconWidth}
          iconHeight={iconHeight}
          emissiveIntensity={lgtDbg.emi}
          interiorLightMax={lgtDbg.iMax}
          openDir={openDir}
          isOpen={isOpen}
          onToggleOpen={onToggleOpen}
        />
      </group>
    </>
  )
}

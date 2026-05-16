import { Canvas } from '@react-three/fiber'
import BlackBox from './BlackCube'

const SPHERE_ROT = { x: -0.25, y: -1.53, z: -0.08 }

export default function BlackCubeSection() {
  return (
    <section className="black-cube-section">
      <div className="black-cube-inner">
        <p className="black-cube-eyebrow">Tecnología &amp; Innovación</p>
        <h2 className="black-cube-heading">Construimos el futuro digital</h2>
        <p className="black-cube-description">
          Arquitecturas sólidas, experiencias de alto impacto y soluciones
          escalables para tu negocio.
        </p>
      </div>

      <div className="black-cube-canvas-wrapper">
        <Canvas
          shadows
          camera={{ position: [0, 2.5, 7], fov: 45 }}
          gl={{ antialias: true }}
        >
          <ambientLight intensity={0.22} />
          <directionalLight
            position={[5, 7, 5]}
            intensity={1.1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-near={0.5}
            shadow-camera-far={25}
            shadow-camera-left={-8}
            shadow-camera-right={8}
            shadow-camera-top={8}
            shadow-camera-bottom={-8}
            shadow-bias={-0.0008}
          />
          <pointLight position={[4, 4, 6]} intensity={0.9} />
          <pointLight position={[-4, -4, 4]} intensity={0.35} color="#ffffff" />
          <BlackBox sphereRot={SPHERE_ROT} emissiveIntensity={0.06} interiorLightMax={2} />
        </Canvas>
      </div>
    </section>
  )
}

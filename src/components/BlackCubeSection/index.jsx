import { Canvas } from '@react-three/fiber'
import { OrbitControls } from "@react-three/drei";
import BlackBox from './BlackCube'

const SPHERE_ROT = { x: -0.25, y: -1.53, z: -0.08 }

export default function BlackCubeSection() {
    var iconUrl = '/images/wolflogo.svg';
    var iconWidth = 0.35;
    var iconHeight = 0.35;
    var sphereBgColor = '#cfcdcd';

    return (
        <section className="black-cube-section">
            <div className="black-cube-inner">
                <p className="black-cube-eyebrow">
                Tecnología &amp; Innovación
                </p>
            </div>

            <div className="black-cube-canvas-wrapper">

                <div className="cube-tooltip drag">
                Arrástre
                </div>

                <div className="cube-tooltip click">
                Click
                </div>

                <Canvas
                shadows
                camera={{ position: [0, 2, 10], fov: 50 }}
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

                <BlackBox
                    sphereRot={SPHERE_ROT}
                    emissiveIntensity={0.06}
                    interiorLightMax={2}
                    bgColor={sphereBgColor}
                    iconUrl={iconUrl}
                    iconWidth={iconWidth}
                    iconHeight={iconHeight}
                />

                <OrbitControls
                    enablePan={false}
                    minDistance={6}
                    maxDistance={16}
                    maxPolarAngle={Math.PI / 1.8}
                    minPolarAngle={Math.PI / 6}
                />
                </Canvas>
            </div>
        </section>
    )
}
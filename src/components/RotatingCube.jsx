import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function RotatingCube() {
  const meshRef = useRef()

  useFrame(() => {
    meshRef.current.rotation.x += 0.01
    meshRef.current.rotation.y += 0.01
  })

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#ff6030" />
    </mesh>
  )
}

export default RotatingCube

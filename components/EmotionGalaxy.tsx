'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Sparkles, Line } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { X, Calendar, Clock } from 'lucide-react'

type Entry = {
  id: string
  content: string
  mood: string
  created_at: string
  image_url?: string
  meal_type?: string
}

// ✨ 新增了 Food, Other 和更多情绪的颜色
const COLORS: Record<string, string> = {
  'Joy': '#FFD700', 'Calm': '#00FFCC', 'Neutral': '#FFFFFF', 'Tired': '#8A2BE2',
  'Stressed': '#FF4500', 
  'Angry': '#FF0000', 'Crying': '#00BFFF', 'Excited': '#FF1493',
  'Sick': '#32CD32', 'Proud': '#FF8C00', 'Love': '#FF69B4',
  'Food': '#FFA500',  // 美食是橙色
  'Other': '#A0A0A0'  // 其他是灰色
}

// --- 1. 连线组件 ---
function Connections({ positions, color }: { positions: THREE.Vector3[], color: string }) {
  const lines = useMemo(() => {
    const points: THREE.Vector3[] = []
    for (let i = 0; i < positions.length; i++) {
      if (i + 1 < positions.length) {
        points.push(positions[i])
        points.push(positions[i + 1])
      }
    }
    return points
  }, [positions])

  return (
    <Line points={lines} color={color} opacity={0.05} transparent lineWidth={0.5} segments />
  )
}

// --- 2. 星球组件 ---
function GravityPlanet({ 
  entry, originalPos, isSelected, isAnySelected, onClick 
}: { 
  entry: Entry; originalPos: [number, number, number]; isSelected: boolean; isAnySelected: boolean; onClick: (e: Entry) => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  // 如果找不到对应颜色，就默认为 Other 的颜色
  const baseColor = COLORS[entry.mood] || COLORS['Other']
  
  const randomSpeed = useMemo(() => 0.5 + Math.random() * 1.5, [])
  const randomOffset = useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    if (!meshRef.current) return
    let targetPos = new THREE.Vector3(...originalPos)
    let targetScale = 1.0

    if (isAnySelected) {
      if (isSelected) {
        targetPos.set(0, 1.5, 8)
        targetScale = 1.4
      } else {
        targetPos.multiplyScalar(0.4)
        targetScale = 0.4
      }
    } else {
      if (hovered) targetScale = 1.3
    }

    const t = state.clock.getElapsedTime()
    const breathe = Math.sin(t * randomSpeed + randomOffset) * 0.05
    
    meshRef.current.position.lerp(targetPos, 0.08)
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale + breathe, 0.1))
    meshRef.current.rotation.y += 0.005
  })

  const getEmissiveIntensity = () => {
    if (isSelected) return 3.5
    if (isAnySelected) return 0.2
    if (hovered) return 2.0
    return 0.5
  }

  return (
    <mesh 
      ref={meshRef}
      onClick={(e) => { e.stopPropagation(); onClick(entry) }}
      onPointerOver={() => { if(!isAnySelected) { document.body.style.cursor = 'pointer'; setHover(true) } }}
      onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
    >
      <sphereGeometry args={[0.5, 32, 32]} /> 
      <meshPhysicalMaterial 
        color={baseColor}
        emissive={baseColor}
        emissiveIntensity={getEmissiveIntensity()}
        roughness={0.2}
        metalness={0.1}
        transmission={0.5}
        thickness={1.5}
        transparent
        opacity={isAnySelected && !isSelected ? 0.3 : 0.9}
      />
    </mesh>
  )
}

// --- 3. 详情弹窗 ---
function DetailModal({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const color = COLORS[entry.mood] || COLORS['Other']
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none p-4 md:p-12">
      <div 
        className={`pointer-events-auto bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col md:flex-row ${entry.image_url ? 'max-w-4xl w-full h-[60vh] md:h-[500px]' : 'max-w-md w-full'}`}
        style={{ boxShadow: `0 0 80px ${color}20`, borderTop: `1px solid ${color}60` }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white p-2 bg-white/5 rounded-full transition-colors z-50">
          <X size={20} />
        </button>

        {entry.image_url && (
          <div className="relative w-full md:w-3/5 h-1/2 md:h-full bg-black/50 flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-white/10">
             <img src={entry.image_url} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" alt="Memory" />
          </div>
        )}

        <div className={`flex-1 flex flex-col p-6 md:p-8 ${entry.image_url ? 'h-1/2 md:h-full' : ''} overflow-y-auto`}>
          <div className="flex items-center gap-4 mb-6 shrink-0">
             <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl bg-white/5 shadow-inner border border-white/10">
                {entry.mood === 'Joy' ? '🥰' : '✨'}
             </div>
             <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-black text-2xl tracking-wide">{entry.mood || 'Memory'}</span>
                  {entry.meal_type && (
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-white/60 uppercase tracking-wider">{entry.meal_type}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
                   <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(entry.created_at).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1"><Clock size={12} /> {new Date(entry.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
             </div>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-white/20 to-transparent mb-6 shrink-0"></div>
          <div className="relative pl-4 border-l-2 flex-1 overflow-y-auto pr-2" style={{ borderColor: `${color}60` }}>
             <p className="text-white/90 leading-loose font-medium text-lg whitespace-pre-wrap">{entry.content}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- 4. 主组件 ---
export default function EmotionGalaxy({ entries, filter }: { entries: Entry[], filter: string | null }) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  // 注意：这里的 entries 已经是父组件筛选过的数据了，直接用
  const positions = useMemo(() => {
    const count = entries.length
    const phi = Math.PI * (3 - Math.sqrt(5))
    const r = 10 

    return entries.map((_, i) => {
      const y = 1 - (i / (count - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i
      return new THREE.Vector3(
        Math.cos(theta) * radius * r,
        y * r,
        Math.sin(theta) * radius * r
      )
    })
  }, [entries])

  const posArray = useMemo(() => positions.map(p => [p.x, p.y, p.z] as [number, number, number]), [positions])
  // 处理 "Food" 和 "Other" 的特殊颜色
  const universeColor = filter ? (COLORS[filter] || COLORS['Other']) : 'white'

  return (
    <div className="w-full h-full bg-black relative">
      {selectedEntry && <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
      <Canvas camera={{ position: [0, 0, 24], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#050508']} />
        <fog attach="fog" args={['#050508', 20, 60]} />
        
        {/* @ts-ignore */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.6} />
        </EffectComposer>
        
        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1} color={universeColor} />
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
        <Sparkles count={100} scale={12} size={2} speed={0.2} opacity={0.3} color={universeColor} />
        
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <group>
             {!selectedEntry && <Connections positions={positions} color={universeColor} />}
             {entries.map((entry, i) => (
                <GravityPlanet 
                  key={entry.id} 
                  entry={entry} 
                  originalPos={posArray[i]}
                  isSelected={selectedEntry?.id === entry.id}
                  isAnySelected={!!selectedEntry}
                  onClick={setSelectedEntry}
                />
             ))}
          </group>
        </Float>
        <OrbitControls enableZoom={!selectedEntry} enablePan={false} autoRotate={!selectedEntry} autoRotateSpeed={0.5} maxDistance={50} minDistance={5} />
      </Canvas>
    </div>
  )
}
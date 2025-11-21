'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Sparkles, Line, Text } from '@react-three/drei'
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

const COLORS: Record<string, string> = {
  'Joy': '#FFD700', 'Calm': '#00FFCC', 'Neutral': '#FFFFFF', 'Tired': '#8A2BE2',
  'Stressed': '#FF4500', 'Angry': '#FF0000', 'Crying': '#00BFFF', 'Excited': '#FF1493',
  'Sick': '#32CD32', 'Proud': '#FF8C00', 'Love': '#FF69B4'
}

// --- 1. 连线组件 (调整为极淡) ---
function Connections({ positions, color }: { positions: THREE.Vector3[], color: string }) {
  const lines = useMemo(() => {
    const points: THREE.Vector3[] = []
    // 连接逻辑：只连最近的邻居，减少杂乱感
    for (let i = 0; i < positions.length; i++) {
      if (i + 1 < positions.length) {
        points.push(positions[i])
        points.push(positions[i + 1])
      }
    }
    return points
  }, [positions])

  return (
    <Line
      points={lines}
      color={color}
      opacity={0.05} // ✨ 5% 透明度，像烟雾一样淡
      transparent
      lineWidth={0.5} // 极细线条
      segments
    />
  )
}

// --- 2. 星球组件 (核心光影逻辑) ---
function GravityPlanet({ 
  entry, 
  originalPos, 
  isSelected, 
  isAnySelected, 
  onClick 
}: { 
  entry: Entry; 
  originalPos: [number, number, number]; 
  isSelected: boolean; 
  isAnySelected: boolean;
  onClick: (e: Entry) => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)
  const baseColor = COLORS[entry.mood] || '#FFFFFF'
  
  const randomSpeed = useMemo(() => 0.5 + Math.random() * 1.5, [])
  const randomOffset = useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    if (!meshRef.current) return
    
    // --- 1. 目标位置与大小 ---
    let targetPos = new THREE.Vector3(...originalPos)
    let targetScale = 1.0

    if (isAnySelected) {
      if (isSelected) {
        // ✨ 主角位置：Z=10 (不要太近，不然会糊脸)，Y=1.5 (稍微靠上，给卡片腾位置)
        targetPos.set(0, 1.5, 10) 
        targetScale = 1.4 // 稍微变大即可，保持精致
      } else {
        // 配角：退后并缩小，形成背景星尘
        targetPos.multiplyScalar(0.4) 
        targetScale = 0.4
      }
    } else {
      // 默认呼吸状态
      if (hovered) targetScale = 1.3
    }

    // --- 2. 动画插值 ---
    const t = state.clock.getElapsedTime()
    const breathe = Math.sin(t * randomSpeed + randomOffset) * 0.05
    
    meshRef.current.position.lerp(targetPos, 0.08) // 0.08 的速度比较优雅
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale + breathe, 0.1))
    meshRef.current.rotation.y += 0.005
  })

  // --- 3. 这里的逻辑控制“亮度” ---
  const getEmissiveIntensity = () => {
    if (isSelected) return 3.5 // ✨ 选中：高亮爆发 (配合 Bloom 特效)
    if (isAnySelected) return 0.2 // 别人选中：我变暗淡
    if (hovered) return 2.0 // 悬停：变亮提示
    return 0.5 // ✨ 平时：暗淡的呼吸灯效果 (你想要的效果)
  }

  return (
    <group>
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(entry) }}
        onPointerOver={() => { if(!isAnySelected) { document.body.style.cursor = 'pointer'; setHover(true) } }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
      >
        {/* 用球体 geometry，分段数 32 保证足够圆 */}
        <sphereGeometry args={[0.5, 32, 32]} /> 
        
        <meshPhysicalMaterial 
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={getEmissiveIntensity()} // 动态光强
          roughness={0.2}
          metalness={0.1}
          transmission={0.5} // 半透明玻璃感
          thickness={1.5}
          transparent
          opacity={isAnySelected && !isSelected ? 0.3 : 0.9} // 没选中时变透明
        />
      </mesh>
    </group>
  )
}

// --- 3. 详情弹窗 ---
function DetailModal({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const color = COLORS[entry.mood] || '#FFFFFF'
  
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* 这里的 pointer-events-auto 保证卡片可以点，背景不能点 */}
      <div 
        className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 slide-in-from-bottom-8"
        style={{ 
          boxShadow: `0 0 60px ${color}30`, // 根据心情颜色的光晕
          borderTop: `1px solid ${color}80` 
        }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white p-2 bg-white/5 rounded-full transition-colors">
          <X size={20} />
        </button>

        {/* 头部 */}
        <div className="flex items-center gap-4 mb-5">
           <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-white/10 shadow-inner">
              {/* 简单的映射，如果你的 mood 是中文需要改这里 */}
              {entry.mood === 'Joy' ? '🥰' : '✨'}
           </div>
           <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-bold text-xl tracking-wide">{entry.mood}</span>
                {entry.meal_type && (
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-md text-white/60 uppercase tracking-wider">
                    {entry.meal_type}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-white/40 font-mono">
                 <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(entry.created_at).toLocaleDateString()}</span>
                 <span className="flex items-center gap-1"><Clock size={10} /> {new Date(entry.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
           </div>
        </div>

        {/* 图片 */}
        {entry.image_url && (
          <div className="rounded-2xl overflow-hidden mb-5 border border-white/10 shadow-lg relative aspect-video group cursor-pointer">
            <img src={entry.image_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
          </div>
        )}

        {/* 文字 */}
        <div className="relative pl-3 border-l-2" style={{ borderColor: `${color}60` }}>
           <p className="text-white/90 leading-relaxed font-medium text-base whitespace-pre-wrap">
             {entry.content}
           </p>
        </div>

      </div>
    </div>
  )
}

// --- 4. 主组件 ---
export default function EmotionGalaxy({ entries, filter }: { entries: Entry[], filter: string | null }) {
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)

  const filteredEntries = useMemo(() => {
    if (!filter) return entries
    return entries.filter(e => e.mood === filter)
  }, [entries, filter])

  // 斐波那契球体坐标
  const positions = useMemo(() => {
    const count = filteredEntries.length
    const phi = Math.PI * (3 - Math.sqrt(5))
    const r = 10 

    return filteredEntries.map((_, i) => {
      const y = 1 - (i / (count - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i
      return new THREE.Vector3(
        Math.cos(theta) * radius * r,
        y * r,
        Math.sin(theta) * radius * r
      )
    })
  }, [filteredEntries])

  const posArray = useMemo(() => positions.map(p => [p.x, p.y, p.z] as [number, number, number]), [positions])
  const universeColor = filter ? (COLORS[filter] || 'white') : 'white'

  return (
    <div className="w-full h-full bg-black relative">
      
      {selectedEntry && <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

      <Canvas camera={{ position: [0, 0, 24], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#050508']} />
        <fog attach="fog" args={['#050508', 20, 60]} />

        {/* @ts-ignore */}
        <EffectComposer disableNormalPass>
          {/* Bloom: 降低阈值，提高强度，让亮的地方更亮 */}
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.5} radius={0.6} />
        </EffectComposer>

        <ambientLight intensity={0.1} />
        <pointLight position={[10, 10, 10]} intensity={1} color={universeColor} />

        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
        <Sparkles count={100} scale={12} size={2} speed={0.2} opacity={0.3} color={universeColor} />

        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <group>
             {/* 连线只在没选中时显示，避免干扰视线 */}
             {!selectedEntry && (
                <Connections positions={positions} color={universeColor} />
             )}

             {filteredEntries.map((entry, i) => (
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

        <OrbitControls 
          enableZoom={!selectedEntry} 
          enablePan={false} 
          autoRotate={!selectedEntry} 
          autoRotateSpeed={0.5}
          maxDistance={50}
          minDistance={5}
        />
      </Canvas>
    </div>
  )
}
'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Stars, Sparkles, Line, Billboard, Text } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { X, Calendar, Clock, MapPin } from 'lucide-react'

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

// --- 1. 智能连线组件 ---
function Connections({ positions, color, opacity }: { positions: THREE.Vector3[], color: string, opacity: number }) {
  // 只连接距离比较近的点，避免线条太乱
  const lines = useMemo(() => {
    const points: THREE.Vector3[] = []
    // 简单算法：每个点和它后面的3个点连线
    for (let i = 0; i < positions.length; i++) {
      for (let j = 1; j <= 3; j++) {
        if (i + j < positions.length) {
          points.push(positions[i])
          points.push(positions[i + j])
        }
      }
    }
    return points
  }, [positions])

  return (
    <Line
      points={lines}
      color={color}
      opacity={opacity} // 动态透明度
      transparent
      lineWidth={1}
      segments
    />
  )
}

// --- 2. 拥有引力动画的星球 ---
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
  
  // 随机参数
  const randomSpeed = useMemo(() => 0.5 + Math.random() * 1.5, [])
  const randomOffset = useMemo(() => Math.random() * 100, [])

  // 动画核心逻辑
  useFrame((state) => {
    if (!meshRef.current) return
    
    // 1. 目标位置计算
    let targetPos = new THREE.Vector3(...originalPos)
    let targetScale = 1.0

    if (isAnySelected) {
      if (isSelected) {
        // 主角：飞到相机面前 (0, 0, 12)
        targetPos.set(0, 0, 12) 
        targetScale = 2.5 // 变大
      } else {
        // 配角：被吸入黑洞，聚拢到中心 (0,0,0) 附近，并变小
        // 这里的 0.3 是压缩比例，越小吸得越紧
        targetPos.multiplyScalar(0.3) 
        targetScale = 0.5 // 变小
      }
    } else {
      // 没人被选中：恢复原状
      if (hovered) targetScale = 1.5
    }

    // 2. 呼吸动画 (Sin波)
    const t = state.clock.getElapsedTime()
    const breathe = Math.sin(t * randomSpeed + randomOffset) * 0.1
    
    // 3. 平滑插值 (Lerp) - 让移动有"引力"的质感
    meshRef.current.position.lerp(targetPos, 0.1) // 0.1 是移动速度
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale + breathe, 0.1))
    
    // 4. 自转
    meshRef.current.rotation.y += 0.01
  })

  return (
    <group>
      <mesh 
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(entry) }}
        onPointerOver={() => { if(!isAnySelected) { document.body.style.cursor = 'pointer'; setHover(true) } }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; setHover(false) }}
      >
        <icosahedronGeometry args={[0.5, 1]} /> 
        <meshPhysicalMaterial 
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={isSelected ? 5 : (hovered ? 3 : 1.5)} // 选中时爆亮
          roughness={0}
          metalness={0.2}
          transmission={0.6}
          thickness={2}
          transparent
          opacity={isAnySelected && !isSelected ? 0.3 : 1} // 没选中的变半透明
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
      {/* 卡片本体 (pointer-events-auto 允许点击) */}
      <div 
        className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/20 p-6 rounded-[32px] max-w-sm w-full mx-4 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500 slide-in-from-bottom-10"
        style={{ 
          boxShadow: `0 0 50px ${color}30`, // 动态光晕
          borderTop: `1px solid ${color}80`
        }}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white p-2 bg-white/5 rounded-full transition-colors">
          <X size={20} />
        </button>

        {/* 头部 */}
        <div className="flex items-center gap-4 mb-5">
           <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/10" style={{ background: `${color}20`, color: color }}>
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
            <img src={entry.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
          </div>
        )}

        {/* 文字 */}
        <div className="relative">
           <div className="absolute -left-3 top-0 bottom-0 w-1 rounded-full" style={{ background: color, opacity: 0.5 }}></div>
           <p className="text-white/90 leading-relaxed font-medium text-base pl-3 whitespace-pre-wrap">
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

  // 筛选数据
  const filteredEntries = useMemo(() => {
    if (!filter) return entries
    return entries.filter(e => e.mood === filter)
  }, [entries, filter])

  // 斐波那契球体坐标
  const positions = useMemo(() => {
    const count = filteredEntries.length
    const phi = Math.PI * (3 - Math.sqrt(5))
    const r = 10 // 宇宙半径

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

  // 转换 positions 为数组给组件用
  const posArray = useMemo(() => positions.map(p => [p.x, p.y, p.z] as [number, number, number]), [positions])

  const universeColor = filter ? (COLORS[filter] || 'white') : 'white'

  return (
    <div className="w-full h-full bg-black relative">
      
      {/* 弹窗层 */}
      {selectedEntry && <DetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}

      <Canvas camera={{ position: [0, 0, 24], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#050508']} />
        <fog attach="fog" args={['#050508', 20, 60]} />

        {/* 特效：保留发光，删掉暗角防止报错 */}
        {/* @ts-ignore */}
        <EffectComposer disableNormalPass>
          <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} radius={0.5} />
        </EffectComposer>

        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color={universeColor} />

        {/* 背景 */}
        <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={0.5} />
        <Sparkles count={150} scale={15} size={3} speed={0.2} opacity={0.4} color={universeColor} />

        {/* 核心内容 */}
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <group>
             {/* 连线：当有选中时不显示，太乱；没选中时显示，增加连接感 */}
             {!selectedEntry && (
                <Connections positions={positions} color={universeColor} opacity={0.15} />
             )}

             {/* 星球 */}
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

        {/* 控制器：选中时锁定视角，没选中时自动旋转 */}
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
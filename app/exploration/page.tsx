'use client'

import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmotionGalaxy from '@/components/EmotionGalaxy'
import { useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Plus, Utensils } from 'lucide-react'

// 1. 核心情绪
const MAIN_MOODS = [
  { name: 'Joy', emoji: '🥰', color: 'bg-yellow-500' },
  { name: 'Calm', emoji: '🌿', color: 'bg-emerald-500' },
  { name: 'Tired', emoji: '😴', color: 'bg-indigo-500' },
  { name: 'Stressed', emoji: '🤯', color: 'bg-red-500' },
  { name: 'Sad', emoji: '💧', color: 'bg-blue-500' },
]

// 2. 更多情绪
const OTHER_MOODS = [
  { name: 'Angry', emoji: '🤬' },
  { name: 'Crying', emoji: '😭' },
  { name: 'Excited', emoji: '🎉' },
  { name: 'Sick', emoji: '🤢' },
  { name: 'Proud', emoji: '😎' },
  { name: 'Love', emoji: '❤️' },
  { name: 'Other', emoji: '💭' },
]

export default function ExplorationPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [showFoodOnly, setShowFoodOnly] = useState(false)
  const [showMore, setShowMore] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      const { data } = await supabase.from('entries').select('*').order('created_at', { ascending: false })
      setEntries(data || [])
      setLoading(false)
    }
    getData()
  }, [])

  // --- 筛选逻辑 ---
  const filteredEntries = useMemo(() => {
    let result = entries
    if (showFoodOnly) {
      result = entries.filter(e => e.meal_type && e.meal_type !== 'Life')
    } else if (filter === 'Other') {
      const allStandardMoods = [...MAIN_MOODS, ...OTHER_MOODS].map(m => m.name).filter(n => n !== 'Other')
      result = entries.filter(e => !allStandardMoods.includes(e.mood))
    } else if (filter) {
      result = entries.filter(e => e.mood === filter)
    }
    return result
  }, [entries, filter, showFoodOnly])

  const handleFilterClick = (moodName: string | null) => {
    setShowFoodOnly(false)
    setFilter(filter === moodName ? null : moodName)
  }

  const handleFoodClick = () => {
    setFilter(null)
    setShowFoodOnly(!showFoodOnly)
  }

  return (
    // ✨✨✨ 核心修复点 ✨✨✨
    // 1. z-[100]: 确保盖住全局导航栏，避免布局冲突
    // 2. h-[100dvh]: 强制使用动态视口高度，防止底部被浏览器栏遮挡
    // 3. fixed inset-0: 钉死在屏幕上，防止偏移
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden h-[100dvh] w-full">
      
      {/* --- 顶部悬浮栏 --- */}
      <div className="absolute top-0 left-0 w-full z-50 p-6 md:p-8 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col">
          {/* 标题：增加 drop-shadow 确保在星星背景上能看清 */}
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {showFoodOnly ? 'FOOD UNIVERSE' : filter ? `${filter.toUpperCase()} GALAXY` : 'MEMORY GALAXY'}
          </h1>
          <p className="text-white/60 text-xs font-mono mt-2 uppercase tracking-[0.3em] drop-shadow-md">
            {filteredEntries.length} Stars Found
          </p>
        </div>

        <Link 
          href="/dashboard"
          className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
        >
          <ArrowLeft size={20} /> Back to Earth
        </Link>
      </div>

      {/* --- 底部筛选器 (HUD) --- */}
      {/* 修复定位：使用 flex 居中，而不是 transform，防止被挤出去 */}
      <div className="absolute bottom-8 left-0 w-full z-50 px-4 pointer-events-auto flex flex-col items-center justify-end gap-4">
        
        {/* 展开菜单 */}
        {showMore && (
          <div className="flex flex-wrap justify-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 max-w-2xl">
            {OTHER_MOODS.map((m) => (
              <button
                key={m.name}
                onClick={() => { handleFilterClick(m.name); setShowMore(false); }}
                className={`px-3 py-1.5 rounded-xl flex items-center gap-2 transition-all border ${
                  filter === m.name
                  ? 'bg-white/20 border-white/50 text-white shadow-lg scale-105'
                  : 'border-transparent text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-base">{m.emoji}</span>
                <span className="text-xs font-bold uppercase">{m.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* 主菜单栏 */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          
          {/* All Stars */}
          <button onClick={() => { setFilter(null); setShowFoodOnly(false); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${!filter && !showFoodOnly ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            All
          </button>

          <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>

          {/* Moods */}
          {MAIN_MOODS.map((m) => (
            <button key={m.name} onClick={() => handleFilterClick(m.name)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${filter === m.name ? 'bg-white/10 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}>
              <span className="text-xl filter drop-shadow-lg">{m.emoji}</span>
            </button>
          ))}
          
          <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>

          {/* Food */}
          <button 
            onClick={handleFoodClick} 
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${showFoodOnly ? 'bg-orange-500/20 border-orange-500/50 text-orange-200 shadow-[0_0_15px_rgba(255,165,0,0.2)] scale-105' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
          >
             <Utensils size={20} />
          </button>

          {/* More */}
          <button 
            onClick={() => setShowMore(!showMore)} 
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${showMore ? 'bg-white/20 text-white' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
          >
             <Plus size={20} />
          </button>

        </div>
      </div>

      {/* --- 3D 舞台 --- */}
      {/* 使用 absolute inset-0 确保填满父容器 */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/30 font-mono animate-pulse">Loading Galaxy...</div>
        ) : (
          <EmotionGalaxy 
             entries={filteredEntries} 
             filter={showFoodOnly ? 'Food' : filter} 
          />
        )}
      </div>

    </div>
  )
}
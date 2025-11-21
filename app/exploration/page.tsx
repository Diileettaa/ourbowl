'use client'

import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmotionGalaxy from '@/components/EmotionGalaxy'
import { useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Plus, Utensils } from 'lucide-react'

// 1. 常用情绪 (显示在 Bar 上)
const MAIN_MOODS = [
  { name: 'Joy', emoji: '🥰' },
  { name: 'Calm', emoji: '🌿' },
  { name: 'Tired', emoji: '😴' },
  { name: 'Stressed', emoji: '🤯' },
  { name: 'Sad', emoji: '💧' },
]

// 2. 更多情绪 (点 + 号显示)
const OTHER_MOODS = [
  { name: 'Angry', emoji: '🤬' },
  { name: 'Crying', emoji: '😭' },
  { name: 'Excited', emoji: '🎉' },
  { name: 'Sick', emoji: '🤢' },
  { name: 'Proud', emoji: '😎' },
  { name: 'Love', emoji: '❤️' },
]

export default function ExplorationPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null) // 当前筛选的情绪名
  const [isFoodMode, setIsFoodMode] = useState(false) // 是否是食物模式
  const [showMoreMenu, setShowMoreMenu] = useState(false) // 是否展开更多菜单
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

  // --- ✨ 核心筛选逻辑 ✨ ---
  const filteredEntries = useMemo(() => {
    if (isFoodMode) {
      // 1. 食物模式：只要 meal_type 存在且不等于 'Life' (生活杂记)
      return entries.filter(e => e.meal_type && e.meal_type !== 'Life')
    }

    if (filter === 'Other') {
      // 2. Other 模式：筛选出那些 mood 不在我们就定义的所有 mood 列表里的
      // 包括：空 mood、自定义文字 mood
      const allDefinedMoods = [...MAIN_MOODS, ...OTHER_MOODS].map(m => m.name)
      return entries.filter(e => !allDefinedMoods.includes(e.mood))
    }

    if (filter) {
      // 3. 正常情绪模式
      return entries.filter(e => e.mood === filter)
    }

    // 4. 默认：显示所有
    return entries
  }, [entries, filter, isFoodMode])

  // 点击普通情绪
  const handleMoodClick = (moodName: string) => {
    setIsFoodMode(false)
    setFilter(filter === moodName ? null : moodName)
  }

  // 点击 Food
  const handleFoodClick = () => {
    setFilter(null)
    setIsFoodMode(!isFoodMode)
  }

  // 点击 Other
  const handleOtherClick = () => {
    setIsFoodMode(false)
    setFilter(filter === 'Other' ? null : 'Other')
    setShowMoreMenu(false)
  }

  return (
    // 布局保持你之前满意的样式：锁死屏幕，黑色背景
    <div className="fixed inset-0 bg-black overflow-hidden">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {isFoodMode ? 'FOOD UNIVERSE' : filter ? `${filter.toUpperCase()} GALAXY` : 'MEMORY GALAXY'}
          </h1>
          <p className="text-white/50 text-xs font-mono mt-2 uppercase tracking-[0.3em]">
            {filteredEntries.length} Stars Found
          </p>
        </div>
        <Link href="/dashboard" className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      {/* --- Bottom Filter Bar --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 pointer-events-auto flex flex-col items-center gap-3">
        
        {/* 展开的菜单 (悬浮在 Bar 上方) */}
        {showMoreMenu && (
          <div className="flex flex-wrap justify-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2">
             {OTHER_MOODS.map(m => (
                <button
                  key={m.name}
                  onClick={() => { handleMoodClick(m.name); setShowMoreMenu(false); }}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${filter === m.name ? 'bg-white/20 border-white/50 text-white' : 'border-transparent text-white/60 hover:bg-white/10'}`}
                >
                  <span>{m.emoji}</span> <span className="text-xs font-bold uppercase">{m.name}</span>
                </button>
             ))}
             {/* 这里的 Other 专门放杂项 */}
             <button
                onClick={handleOtherClick}
                className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${filter === 'Other' ? 'bg-white/20 border-white/50 text-white' : 'border-transparent text-white/60 hover:bg-white/10'}`}
             >
                <span>💭</span> <span className="text-xs font-bold uppercase">Other / Custom</span>
             </button>
          </div>
        )}

        {/* 主 Bar */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          {/* All */}
          <button onClick={() => { setFilter(null); setIsFoodMode(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${!filter && !isFoodMode ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10'}`}>
            All
          </button>
          
          <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>

          {/* Main Moods */}
          {MAIN_MOODS.map((m) => (
            <button key={m.name} onClick={() => handleMoodClick(m.name)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${filter === m.name ? 'bg-white/10 border-white/50 text-white scale-105' : 'border-transparent text-white/50 hover:bg-white/5'}`}>
              <span className="text-lg filter drop-shadow-lg">{m.emoji}</span>
            </button>
          ))}

          <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>

          {/* 🍽️ Food Button */}
          <button 
             onClick={handleFoodClick}
             className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${isFoodMode ? 'bg-orange-500/30 border-orange-500 text-orange-200 scale-105' : 'border-transparent text-white/50 hover:bg-white/5'}`}
             title="Food Universe"
          >
             <Utensils size={18} />
          </button>

          {/* ➕ More Button */}
          <button 
             onClick={() => setShowMoreMenu(!showMoreMenu)}
             className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${showMoreMenu ? 'bg-white/20 text-white' : 'border-transparent text-white/50 hover:bg-white/5'}`}
          >
             <Plus size={18} />
          </button>
        </div>
      </div>

      {/* 3D 场景 (透传筛选后的数据) */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/30 font-mono animate-pulse">Loading...</div>
        ) : (
          <EmotionGalaxy 
            entries={filteredEntries} 
            filter={isFoodMode ? 'Food' : (filter || null)} 
          />
        )}
      </div>

    </div>
  )
}
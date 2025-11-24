'use client'

import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmotionGalaxy from '@/components/EmotionGalaxy'
import { useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Plus, Utensils } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext' // <--- 1. 引入 Profile 工具

// 1. 常用情绪
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
]

export default function ExplorationPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null)
  const [isFoodMode, setIsFoodMode] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // 2. 获取当前选中的档案 (Me 或 Mochi)
  const { currentProfile } = useProfile()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      // 3. 核心逻辑：只获取【当前档案】的数据
      if (currentProfile) {
        const { data } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_id', currentProfile.id) // <--- 关键过滤条件
          .order('created_at', { ascending: false })
        
        setEntries(data || [])
        setLoading(false)
      }
    }
    getData()
  }, [currentProfile]) // <--- 4. 监听变化：一换人，马上重载宇宙

  // --- 筛选逻辑 (保持你原来的不变) ---
  const filteredEntries = useMemo(() => {
    if (isFoodMode) {
      return entries.filter(e => e.meal_type && e.meal_type !== 'Life')
    }
    if (filter === 'Other') {
      const allDefinedMoods = [...MAIN_MOODS, ...OTHER_MOODS].map(m => m.name)
      return entries.filter(e => !allDefinedMoods.includes(e.mood))
    }
    if (filter) {
      return entries.filter(e => e.mood === filter)
    }
    return entries
  }, [entries, filter, isFoodMode])

  const handleMoodClick = (moodName: string) => {
    setIsFoodMode(false)
    setFilter(filter === moodName ? null : moodName)
  }

  const handleFoodClick = () => {
    setFilter(null)
    setIsFoodMode(!isFoodMode)
  }

  const handleOtherClick = () => {
    setIsFoodMode(false)
    setFilter(filter === 'Other' ? null : 'Other')
    setShowMoreMenu(false)
  }

  return (
    // 布局保持：黑色背景，锁死屏幕
    <div className="fixed inset-0 bg-black overflow-hidden flex flex-col">

      {/* Header */}
      <div className="relative z-20 p-6 flex justify-between items-start pointer-events-none shrink-0">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {/* 动态显示名字 */}
            {isFoodMode ? 'FOOD UNIVERSE' : filter ? `${filter.toUpperCase()} GALAXY` : `${currentProfile?.name || 'MEMORY'} GALAXY`}
          </h1>
          <p className="text-white/50 text-xs font-mono mt-2 uppercase tracking-[0.3em]">
            {filteredEntries.length} Stars Found
          </p>
        </div>
        <Link href="/dashboard" className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      {/* 3D 舞台 */}
      <div className="flex-1 relative z-0 w-full min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/30 font-mono animate-pulse">Loading Galaxy...</div>
        ) : (
          <EmotionGalaxy 
            entries={filteredEntries} 
            filter={isFoodMode ? 'Food' : (filter || null)} 
          />
        )}
      </div>

      {/* Bottom Filter Bar */}
      <div className="relative z-20 w-full flex justify-center pointer-events-auto shrink-0 pb-8 pt-4">
         <div className="flex flex-col items-center gap-3 max-w-[90vw]">
            
            {showMoreMenu && (
              <div className="flex flex-wrap justify-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 mb-1">
                 {OTHER_MOODS.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => { handleMoodClick(m.name); setShowMoreMenu(false); }}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${filter === m.name ? 'bg-white/20 border-white/50 text-white' : 'border-transparent text-white/60 hover:bg-white/10'}`}
                    >
                      <span>{m.emoji}</span> <span className="text-xs font-bold uppercase">{m.name}</span>
                    </button>
                 ))}
                 <button
                    onClick={handleOtherClick}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${filter === 'Other' ? 'bg-white/20 border-white/50 text-white' : 'border-transparent text-white/60 hover:bg-white/10'}`}
                 >
                    <span>💭</span> <span className="text-xs font-bold uppercase">Other</span>
                 </button>
              </div>
            )}

            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar max-w-full">
              <button onClick={() => { setFilter(null); setIsFoodMode(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${!filter && !isFoodMode ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                All
              </button>

              <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>

              {MAIN_MOODS.map((m) => (
                <button key={m.name} onClick={() => handleMoodClick(m.name)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${filter === m.name ? 'bg-white/10 border-white/50 text-white scale-105' : 'border-transparent text-white/50 hover:bg-white/5'}`}>
                  <span className="text-lg filter drop-shadow-lg">{m.emoji}</span>
                </button>
              ))}

              <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>

              <button onClick={handleFoodClick} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${isFoodMode ? 'bg-orange-500/30 border-orange-500 text-orange-200 scale-105' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}>
                 <Utensils size={18} />
              </button>

              <button onClick={() => setShowMoreMenu(!showMoreMenu)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${showMoreMenu ? 'bg-white/20 text-white' : 'border-transparent text-white/50 hover:bg-white/5'}`}>
                 <Plus size={18} />
              </button>
            </div>
         </div>
      </div>

    </div>
  )
}
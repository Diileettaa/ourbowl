'use client'

import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmotionGalaxy from '@/components/EmotionGalaxy'
import { useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Plus, Utensils } from 'lucide-react'

// 1. 核心情绪 (显示在外面)
const MAIN_MOODS = [
  { name: 'Joy', emoji: '🥰', color: 'bg-yellow-500' },
  { name: 'Calm', emoji: '🌿', color: 'bg-emerald-500' },
  { name: 'Tired', emoji: '😴', color: 'bg-indigo-500' },
  { name: 'Stressed', emoji: '🤯', color: 'bg-red-500' },
  { name: 'Sad', emoji: '💧', color: 'bg-blue-500' },
]

// 2. 更多情绪 (折叠在 + 里面)
const OTHER_MOODS = [
  { name: 'Angry', emoji: '🤬' },
  { name: 'Crying', emoji: '😭' },
  { name: 'Excited', emoji: '🎉' },
  { name: 'Sick', emoji: '🤢' },
  { name: 'Proud', emoji: '😎' },
  { name: 'Love', emoji: '❤️' },
  { name: 'Other', emoji: '💭' }, // 专门放没选情绪的
]

export default function ExplorationPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null) // 筛选情绪
  const [showFoodOnly, setShowFoodOnly] = useState(false)   // 筛选食物
  const [showMore, setShowMore] = useState(false)           // 展开更多菜单
  
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

  // --- 核心筛选逻辑 ---
  // 把筛选逻辑提上来，传给子组件
  const filteredEntries = useMemo(() => {
    let result = entries

    if (showFoodOnly) {
      // 1. 如果选了食物模式：只看 meal_type 有值的
      result = entries.filter(e => e.meal_type && e.meal_type !== 'Life')
    } else if (filter === 'Other') {
      // 2. 如果选了 Other：看那些既不是主情绪，也不是副情绪，或者是自定义文字的
      const allStandardMoods = [...MAIN_MOODS, ...OTHER_MOODS].map(m => m.name).filter(n => n !== 'Other')
      result = entries.filter(e => !allStandardMoods.includes(e.mood))
    } else if (filter) {
      // 3. 正常情绪筛选
      result = entries.filter(e => e.mood === filter)
    }
    
    return result
  }, [entries, filter, showFoodOnly])

  // 点击筛选按钮的处理函数
  const handleFilterClick = (moodName: string | null) => {
    setShowFoodOnly(false) // 关掉食物模式
    setFilter(filter === moodName ? null : moodName) // 切换情绪
  }

  const handleFoodClick = () => {
    setFilter(null) // 清空情绪
    setShowFoodOnly(!showFoodOnly) // 切换食物模式
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      
      {/* 顶部悬浮栏 */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {showFoodOnly ? 'FOOD UNIVERSE' : filter ? `${filter.toUpperCase()} GALAXY` : 'MEMORY GALAXY'}
          </h1>
          <p className="text-white/50 text-xs font-mono mt-2 uppercase tracking-[0.3em]">
            {filteredEntries.length} Stars Found
          </p>
        </div>
        <Link href="/dashboard" className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      {/* --- 底部筛选器 (升级版) --- */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-3xl px-4 pointer-events-auto flex justify-center flex-col items-center gap-3">
        
        {/* 展开的更多菜单 (悬浮在上方) */}
        {showMore && (
          <div className="flex flex-wrap justify-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 mb-2">
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
          
          {/* 1. All Stars */}
          <button onClick={() => { setFilter(null); setShowFoodOnly(false); }} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${!filter && !showFoodOnly ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            All Stars
          </button>

          <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>

          {/* 2. 主要情绪 */}
          {MAIN_MOODS.map((m) => (
            <button key={m.name} onClick={() => handleFilterClick(m.name)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${filter === m.name ? 'bg-white/10 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}>
              <span className="text-lg filter drop-shadow-lg">{m.emoji}</span>
            </button>
          ))}
          
          <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>

          {/* 3. 🍽️ Food Universe */}
          <button 
            onClick={handleFoodClick} 
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${showFoodOnly ? 'bg-orange-500/20 border-orange-500/50 text-orange-200 shadow-[0_0_15px_rgba(255,165,0,0.2)] scale-105' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
            title="Food Universe"
          >
             <Utensils size={18} />
          </button>

          {/* 4. + More */}
          <button 
            onClick={() => setShowMore(!showMore)} 
            className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${showMore ? 'bg-white/20 text-white' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}
          >
             <Plus size={18} />
          </button>

        </div>
      </div>

      {/* 3. 3D 舞台 (直接把筛选好的数据传进去，不用组件内部再筛了) */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/30 font-mono animate-pulse">Loading...</div>
        ) : (
          // 注意：这里我们把筛选逻辑提到了父组件，所以这里直接传 filteredEntries 给 entries 属性
          // 这里的 filter 属性只是为了传颜色，如果 showFoodOnly 为真，我们假装传个 'Food' 让它变色
          <EmotionGalaxy 
             entries={filteredEntries} 
             filter={showFoodOnly ? 'Food' : filter} 
          />
        )}
      </div>

    </div>
  )
}
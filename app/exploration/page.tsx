'use client'

import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmotionGalaxy from '@/components/EmotionGalaxy'
import { useEffect, useState, useMemo } from 'react'
import { ArrowLeft, Plus, Utensils } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext' // <--- 1. 引入

const MAIN_MOODS = [
  { name: 'Joy', emoji: '🥰', color: 'bg-yellow-500' },
  { name: 'Calm', emoji: '🙂', color: 'bg-emerald-500' },
  { name: 'Tired', emoji: '😴', color: 'bg-indigo-500' },
  { name: 'Stressed', emoji: '🤯', color: 'bg-red-500' },
  { name: 'Sad', emoji: '💧', color: 'bg-blue-500' },
]

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
  
  // 2. 获取当前档案
  const { currentProfile } = useProfile()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      
      // 3. 核心修改：只查当前档案的星星
      if (currentProfile) {
        const { data } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_id', currentProfile.id) // <--- 过滤条件
          .order('created_at', { ascending: false })
          
        setEntries(data || [])
        setLoading(false)
      }
    }
    getData()
  }, [currentProfile]) // <--- 监听变化

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
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col">
      
      <div className="relative z-20 p-6 flex justify-between items-start pointer-events-none shrink-0">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {/* 动态标题 */}
            {currentProfile?.name}'s GALAXY
          </h1>
          <p className="text-white/50 text-xs font-mono mt-2 uppercase tracking-[0.3em]">
            {filteredEntries.length} Stars Found
          </p>
        </div>

        <Link href="/dashboard" className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg">
          <ArrowLeft size={20} /> Back to Earth
        </Link>
      </div>

      <div className="flex-1 relative z-0 w-full min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/30 font-mono animate-pulse">Loading Galaxy...</div>
        ) : (
          <EmotionGalaxy 
             entries={filteredEntries} 
             filter={showFoodOnly ? 'Food' : filter} 
          />
        )}
      </div>

      {/* 底部筛选器 */}
      <div className="relative z-20 w-full flex justify-center pointer-events-auto shrink-0 pb-8 pt-4">
         <div className="flex flex-col items-center gap-3 max-w-[90vw]">
            
            {showMore && (
              <div className="flex flex-wrap justify-center gap-2 bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-2 mb-1">
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

            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar max-w-full">
              <button onClick={() => { setFilter(null); setShowFoodOnly(false); }} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${!filter && !showFoodOnly ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                All
              </button>
              <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>
              {MAIN_MOODS.map((m) => (
                <button key={m.name} onClick={() => handleFilterClick(m.name)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${filter === m.name ? 'bg-white/10 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}>
                  <span className="text-xl filter drop-shadow-lg">{m.emoji}</span>
                </button>
              ))}
              <div className="w-px h-6 bg-white/10 shrink-0 mx-1"></div>
              <button onClick={handleFoodClick} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${showFoodOnly ? 'bg-orange-500/20 border-orange-500/50 text-orange-200 shadow-[0_0_15px_rgba(255,165,0,0.2)] scale-105' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}>
                 <Utensils size={20} />
              </button>
              <button onClick={() => setShowMore(!showMore)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${showMore ? 'bg-white/20 text-white' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}>
                 <Plus size={20} />
              </button>
            </div>
         </div>
      </div>

    </div>
  )
}
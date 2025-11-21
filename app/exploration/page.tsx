'use client'

import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EmotionGalaxy from '@/components/EmotionGalaxy'
import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

const MOODS = [
  { name: 'Joy', emoji: '🥰', color: 'bg-yellow-500' },
  { name: 'Calm', emoji: '🙂', color: 'bg-emerald-500' },
  { name: 'Tired', emoji: '😴', color: 'bg-indigo-500' },
  { name: 'Stressed', emoji: '🤯', color: 'bg-red-500' },
  { name: 'Sad', emoji: '💧', color: 'bg-blue-500' },
]

export default function ExplorationPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [filter, setFilter] = useState<string | null>(null)
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

  return (
    // ✨ 关键：h-screen w-screen fixed inset-0 -> 锁死屏幕，不允许滚动
    <div className="fixed inset-0 bg-black overflow-hidden">
      
      {/* 1. 顶部悬浮栏 */}
      <div className="absolute top-0 left-0 w-full z-20 p-6 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            {filter ? `${filter} Universe` : 'MEMORY GALAXY'}
          </h1>
          <p className="text-white/50 text-xs font-mono mt-2 uppercase tracking-[0.3em]">
            {entries.length} Memories Found
          </p>
        </div>

        <Link href="/dashboard" className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95">
          <ArrowLeft size={18} /> Back
        </Link>
      </div>

      {/* 2. 底部筛选器 (固定在底部 30px) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 pointer-events-auto flex justify-center">
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          <button onClick={() => setFilter(null)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filter === null ? 'bg-white text-black' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
            All Stars
          </button>
          <div className="w-px h-6 bg-white/10 shrink-0"></div>
          {MOODS.map((m) => (
            <button key={m.name} onClick={() => setFilter(filter === m.name ? null : m.name)} className={`px-3 py-2 rounded-xl flex items-center gap-2 transition-all border shrink-0 ${filter === m.name ? 'bg-white/10 border-white/50 text-white shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105' : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'}`}>
              <span className="text-lg filter drop-shadow-lg">{m.emoji}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. 3D 舞台 (占满全屏) */}
      <div className="absolute inset-0 z-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-white/30 font-mono animate-pulse">Loading...</div>
        ) : (
          <EmotionGalaxy entries={entries} filter={filter} />
        )}
      </div>

    </div>
  )
}
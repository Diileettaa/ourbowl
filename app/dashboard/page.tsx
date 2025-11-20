'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi'
import { X } from 'lucide-react'

const moodEmojiMap: Record<string, string> = {
  'Joy': '🥰', 'Calm': '🌿', 'Neutral': '😶', 'Tired': '😴', 'Stressed': '🤯',
  'Angry': '🤬', 'Crying': '😭', 'Excited': '🎉', 'Sick': '🤢', 'Proud': '😎', 'Love': '❤️'
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [pet, setPet] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      const { data: petData } = await supabase.from('pet_states').select('*').eq('user_id', user.id).single()
      setPet(petData)
      const { data: entryData } = await supabase.from('entries').select('*').order('created_at', { ascending: false })
      setEntries(entryData || [])
    }
    getData()
  }, [])

  if (!user) return null

  return (
    // 1. 背景回归：暖黄 -> 冷白 渐变
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBF0] via-[#F7F9FC] to-[#F0F2F5] pb-20 relative">
      
      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-10 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Hello, Owner</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 font-mono">{user.email}</p>
          </div>
          <Link href="/exploration" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all">
            🪐
          </Link>
        </div>

        {/* 🌟 宠物专属区域 (Pet Card) 🌟 */}
        {/* 这是一个丰富的大卡片，左边是信息，右边是宠物 */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-white mb-10 relative overflow-visible">
           <div className="flex justify-between items-center">
              
              {/* 左侧信息 */}
              <div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pet Status</div>
                 <h2 className="text-xl font-bold text-gray-800 mb-1">Mochi is Active</h2>
                 <p className="text-sm text-gray-400">Level 1 • Baby Phase</p>
                 
                 {/* 小标签 */}
                 <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-orange-50 text-orange-400 text-xs font-bold rounded-full">LV.1 Baby</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-400 text-xs font-bold rounded-full">✨ Happy</span>
                 </div>
              </div>

              {/* 右侧：宠物 (位置微微突出卡片，更有立体感) */}
              <div className="w-32 h-24 relative -mr-4 -mt-6">
                 {pet ? <PetMochi lastFedAt={pet.last_fed_at} /> : <div className="text-2xl">🥚</div>}
              </div>
           </div>
        </div>

        {/* 输入框 */}
        <div className="mb-12">
           <MagicBar />
        </div>

        {/* 列表内容 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 opacity-50 px-2">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">History</span>
             <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {entries.map((entry) => {
             const lines = entry.content?.split('\n') || []
             const title = lines[0] || 'Moment'
             const details = lines.slice(1).join(' ')
             const moodEmoji = moodEmojiMap[entry.mood] || null

             return (
              <div key={entry.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-white hover:shadow-md transition-all flex justify-between gap-4 group">
                
                <div className="flex-1 flex flex-col min-w-0">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                         entry.meal_type === 'Life' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {entry.meal_type || 'Note'}
                      </span>
                      <div className="text-lg">{moodEmoji}</div>
                   </div>
                   <h4 className="text-gray-800 font-bold text-lg truncate pr-2 mb-1">{title}</h4>
                   {details.replace('💭', '').trim() && (
                     <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3 font-medium">
                       {details.replace('💭', '').trim()}
                     </p>
                   )}
                   <div className="mt-auto text-[10px] text-gray-300 font-mono">
                      {new Date(entry.created_at).toLocaleString()}
                   </div>
                </div>

                {entry.image_url && (
                  <div className="w-24 h-24 shrink-0 rounded-2xl bg-gray-100 overflow-hidden cursor-zoom-in relative shadow-inner border border-gray-100" onClick={() => setSelectedImage(entry.image_url)}>
                    <img src={entry.image_url} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
             )
          })}
        </div>

      </div>
    </div>
  )
}
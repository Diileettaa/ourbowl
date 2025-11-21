'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi'
import { X } from 'lucide-react'

const moodEmojiMap: Record<string, string> = {
  'Joy': '🥰', 'Calm': '🙂', 'Neutral': '😶', 'Tired': '😴', 'Stressed': '🤯',
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
    // ✨ 背景重点：从极淡奶黄(#FFFBEB) 渐变到 冷灰白(#F1F5F9)
    // 这里的 padding-bottom (pb-20) 是为了防止底部内容贴边
    <div className="min-h-screen bg-gradient-to-b from-[#F9FAFB] via-[#FDFDFD] to-[#F1F5F9] pb-20 relative">


      
      {/* --- 图片全屏查看器 (Lightbox) --- */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      {/* 主内容区域：pt-28 是为了给顶部的导航栏留出空间，同时让背景色延伸上去 */}
      <div className="max-w-2xl mx-auto px-4 pt-28 relative z-10">
        
        {/* 1. Header: 欢迎语 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Hello, Owner</h1>
            <p className="text-sm text-gray-400 font-medium mt-1 font-mono">{user.email}</p>
          </div>
          <Link href="/exploration" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-[#FFFBEB]">
            🪐
          </Link>
        </div>

        {/* 2. 宠物区域 (Pet Card) */}
        {/* 使用半透明白色背景 (bg-white/60) 让底部的黄色透出来一点点，增加融合感 */}
        <div className="bg-white/60 backdrop-blur-md p-6 rounded-[32px] shadow-sm border border-white/60 mb-10 relative overflow-visible">
           <div className="flex justify-between items-center">
              
              {/* 左侧信息 */}
              <div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pet Status</div>
                 <h2 className="text-xl font-bold text-gray-800 mb-1">Mochi is Active</h2>
                 <p className="text-sm text-gray-400">Level 1 • Baby Phase</p>
                 
                 {/* 状态小标签 */}
                 <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-orange-100/50 text-orange-500 text-xs font-bold rounded-full">LV.1 Baby</span>
                    <span className="px-3 py-1 bg-blue-100/50 text-blue-500 text-xs font-bold rounded-full">✨ Happy</span>
                 </div>
              </div>

              {/* 右侧：宠物 (位置稍微突出卡片一点点) */}
              <div className="w-32 h-24 relative -mr-4 -mt-6">
                 {pet ? <PetMochi lastFedAt={pet.last_fed_at} /> : <div className="text-2xl">🥚</div>}
              </div>
           </div>
        </div>

        {/* 3. 输入框 (MagicBar) */}
        <div className="mb-12">
           <MagicBar />
        </div>

        {/* 4. 列表内容 (History) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4 opacity-50 px-2">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">History</span>
             <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          {entries.map((entry) => {
             const lines = entry.content?.split('\n') || []
             const title = lines[0] || 'Moment'
             const details = lines.slice(1).join(' ')
             const moodEmoji = moodEmojiMap[entry.mood] || null

             return (
              <div key={entry.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-white hover:shadow-md transition-all flex justify-between gap-4 group">
                
                {/* 左侧：文字信息 (自适应宽度) */}
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

                {/* 右侧：图片 (如果有图片，显示正方形缩略图) */}
                {entry.image_url && (
                  <div 
                    className="w-24 h-24 shrink-0 rounded-2xl bg-gray-100 overflow-hidden cursor-zoom-in relative shadow-inner border border-gray-100"
                    onClick={() => setSelectedImage(entry.image_url)}
                  >
                    <img src={entry.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
              </div>
             )
          })}
          
          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-300 text-sm">
              No memories yet. Start recording!
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
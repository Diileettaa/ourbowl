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
  'Angry': '🤬', 'Crying': '😭', 'Excited': '😍', 'Sick': '🤢', 'Proud': '😎', 'Love': '❤️'
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
    // 1. 暖色背景渐变
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-[#F5F7FA] pb-20 relative">
      
      {/* 图片放大查看器 */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-8 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Hello, Owner</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">{user.email}</p>
          </div>
          <Link href="/exploration" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
            🪐
          </Link>
        </div>

        {/* 🌟 宠物区：连接上下 */}
        <div className="flex justify-center mb-6 -mt-2 relative z-0">
           {/* 这个容器模拟了桌子/碗的感觉 */}
           <div className="w-full h-48 flex items-end justify-center">
              {pet ? <PetMochi lastFedAt={pet.last_fed_at} /> : <div className="text-4xl animate-bounce">🥚</div>}
           </div>
        </div>

        {/* 输入框 (浮在宠物下面) */}
        <div className="mb-10 sticky top-6 z-40 -mt-8">
           <MagicBar />
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recent</h3>
          <span className="text-[10px] font-bold text-gray-400 bg-white/50 px-2 py-1 rounded-md">Today</span>
        </div>

        {/* 🌟 列表：左文右图 */}
        <div className="space-y-3">
          {entries.map((entry) => {
             const lines = entry.content?.split('\n') || []
             const title = lines[0] || 'Moment'
             const details = lines.slice(1).join(' ')
             const moodEmoji = moodEmojiMap[entry.mood] || null

             return (
    // 背景：还是保持温暖的渐变
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#F5F7FA] pb-20 relative">
      
      {/* 图片放大器 (保持不变) */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-8 relative z-10">
        
        {/* Header: 只有文字和星球按钮，去掉了状态条 */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Hello, {user.email?.split('@')[0]}</h1>
            <p className="text-sm text-gray-400 font-medium mt-1">Ready to record your day?</p>
          </div>
          <Link href="/exploration" className="w-12 h-12 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 hover:rotate-12 transition-all border-4 border-[#FFF8F0]">
            🪐
          </Link>
        </div>

        {/* 🌟 宠物舞台：专门留一大块地给它，防止变形 */}
        <div className="relative h-48 flex items-end justify-center z-0 pointer-events-none">
            {/* 把 pointer-events 设为 auto 让团子可以被点击 */}
            <div className="pointer-events-auto scale-110 origin-bottom"> 
               {pet ? <PetMochi lastFedAt={pet.last_fed_at} /> : <div className="text-4xl animate-bounce">🥚</div>}
            </div>
        </div>

        {/* 输入框：向上移动，盖住一点点宠物的碗底，形成连接感 */}
        <div className="mb-10 sticky top-6 z-40 -mt-6">
           <MagicBar />
        </div>

        {/* 列表标题 */}
        <div className="flex items-center justify-between mb-4 px-2 mt-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Memory Lane</h3>
          <span className="text-[10px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">Today</span>
        </div>

        {/* 列表内容 (保持你喜欢的 左文右图) */}
        <div className="space-y-4">
          {entries.map((entry) => {
             // ... 这里的代码和之前一样，不用动 ...
             const lines = entry.content?.split('\n') || []
             const title = lines[0] || 'Moment'
             const details = lines.slice(1).join(' ')
             const moodEmoji = moodEmojiMap[entry.mood] || null

             return (
              <div key={entry.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-white/50 hover:shadow-md transition-all flex justify-between gap-4 group">
                
                <div className="flex-1 flex flex-col min-w-0">
                   <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide ${
                         entry.meal_type === 'Life' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {entry.meal_type || 'Note'}
                      </span>
                      <div className="text-lg filter grayscale-[0.3] group-hover:grayscale-0 transition-all">
                        {moodEmoji}
                      </div>
                   </div>

                   <h4 className="text-gray-800 font-bold text-lg truncate pr-2 mb-1">{title}</h4>
                   
                   {details.replace('💭', '').trim() && (
                     <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3 font-medium">
                       {details.replace('💭', '').trim()}
                     </p>
                   )}

                   <div className="mt-auto text-[10px] text-gray-300 font-mono flex gap-2">
                      <span>{new Date(entry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                   </div>
                </div>

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
            <div className="text-center py-12">
              <p className="text-gray-300 text-sm">Waiting for your first story...</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
          })}

          {entries.length === 0 && (
            <div className="text-center py-10 text-gray-300 text-sm">No records yet.</div>
          )}
        </div>

      </div>
    </div>
  )
}
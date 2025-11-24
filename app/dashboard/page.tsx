'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi'
import { X, ArrowRight, Edit2, Trash2 } from 'lucide-react'
import { useProfile } from '@/context/ProfileContext' // <--- 1. 引入这个工具

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
  
  // 2. 获取当前选中的档案
  const { currentProfile } = useProfile() 

  // 获取数据函数
  const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      setUser(user)
      
      // 获取宠物状态 (宠物是共享的，所以不用按档案筛选)
      const { data: petData } = await supabase.from('pet_states').select('*').eq('user_id', user.id).single()
      setPet(petData)
      
      // 3. 获取日记 (关键修改！！！)
      if (currentProfile) {
        const { data: entryData } = await supabase
          .from('entries')
          .select('*')
          .eq('user_id', user.id)
          .eq('profile_id', currentProfile.id) // <--- 只看当前档案的日记！
          .order('created_at', { ascending: false })
          .limit(5)
        
        setEntries(entryData || [])
      }
  }

  // 4. 监听 currentProfile 的变化
  // 只要你一切换头像，这个 useEffect 就会重新跑一遍 fetchData
  useEffect(() => { 
    fetchData() 
  }, [currentProfile]) 

  // --- 删除功能 ---
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this memory?')) {
      await supabase.from('entries').delete().eq('id', id)
      fetchData() 
    }
  }

  // --- 编辑功能 ---
  const handleEdit = async (entry: any) => {
    const newContent = prompt('Edit your memory:', entry.content)
    if (newContent && newContent !== entry.content) {
      await supabase.from('entries').update({ content: newContent }).eq('id', entry.id)
      fetchData() 
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBEB] to-[#F1F5F9] pb-20 relative">
      
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-28 relative z-10">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              {/* 显示当前档案的名字 */}
              Hello, {currentProfile?.name || 'Owner'}
            </h1>
            <p className="text-sm text-gray-400 font-medium mt-1 font-mono">{user.email}</p>
          </div>
          <Link href="/exploration" className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-[#FFFBEB]">
            🪐
          </Link>
        </div>

        <div className="bg-white/60 backdrop-blur-md p-6 rounded-[32px] shadow-sm border border-white/60 mb-10 relative overflow-visible">
           <div className="flex justify-between items-center">
              <div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Pet Status</div>
                 <h2 className="text-xl font-bold text-gray-800 mb-1">Mochi is Active</h2>
                 <p className="text-sm text-gray-400">Level 1 • Baby Phase</p>
                 <div className="flex gap-2 mt-4">
                    <span className="px-3 py-1 bg-orange-100/50 text-orange-500 text-xs font-bold rounded-full">LV.1 Baby</span>
                    <span className="px-3 py-1 bg-blue-100/50 text-blue-500 text-xs font-bold rounded-full">✨ Happy</span>
                 </div>
              </div>
              <div className="w-32 h-24 relative -mr-4 -mt-6">
                 {pet ? <PetMochi lastFedAt={pet.last_fed_at} /> : <div className="text-2xl">🥚</div>}
              </div>
           </div>
        </div>

        <div className="mb-12">
           <MagicBar />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2 px-2">
             <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
               {/* 动态标题：显示是谁的日记 */}
               {currentProfile?.name}'s Recent
             </span>
             <Link href="/journey" className="text-[10px] font-bold text-gray-400 hover:text-gray-900 flex items-center gap-1 transition-colors">
               View All <ArrowRight size={12}/>
             </Link>
          </div>

          {entries.map((entry) => {
             const lines = entry.content?.split('\n') || []
             const title = lines[0] || 'Moment'
             const details = lines.slice(1).join(' ')
             const moodEmoji = moodEmojiMap[entry.mood] || null

             return (
              <div key={entry.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex justify-between gap-4 group relative">
                
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => handleEdit(entry)} className="p-1.5 bg-yellow-100 text-yellow-600 rounded-lg hover:bg-yellow-200"><Edit2 size={12} /></button>
                   <button onClick={() => handleDelete(entry.id)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"><Trash2 size={12} /></button>
                </div>

                <div className="flex-1 flex flex-col min-w-0">
                   <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                         entry.meal_type === 'Life' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {entry.meal_type || 'Note'}
                      </span>
                      <div className="text-lg">{moodEmoji}</div>
                      {entry.is_public && <span className="text-[10px] text-green-500 font-bold border border-green-200 px-1 rounded">Public</span>}
                   </div>

                   <h4 className="text-gray-900 font-bold text-base truncate pr-2 mb-1">{title}</h4>
                   
                   {details.replace('💭', '').trim() && (
                     <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                       {details.replace('💭', '').trim()}
                     </p>
                   )}

                   <div className="mt-auto text-[10px] text-gray-300 font-mono">
                      {new Date(entry.created_at).toLocaleString()}
                   </div>
                </div>

                {entry.image_url && (
                  <div className="w-20 h-20 shrink-0 rounded-xl bg-gray-100 overflow-hidden cursor-zoom-in border border-gray-100" onClick={() => setSelectedImage(entry.image_url)}>
                    <img src={entry.image_url} className="w-full h-full object-cover" />
                  </div>
                )}

              </div>
             )
          })}

          {entries.length === 0 && (
            <div className="text-center py-12 text-gray-300 text-sm">
              No memories for {currentProfile?.name} yet. Start recording!
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
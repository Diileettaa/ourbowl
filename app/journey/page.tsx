'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X, Maximize2, Edit2, Trash2 } from 'lucide-react'

const moodEmojiMap: Record<string, string> = {
  'Joy': '🥰', 'Calm': '🙂', 'Neutral': '😶', 'Tired': '😴', 'Stressed': '🤯',
  'Angry': '🤬', 'Crying': '😭', 'Excited': '🎉', 'Sick': '🤢', 'Proud': '😎', 'Love': '❤️'
}

export default function JourneyPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const router = useRouter()

  const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }
      
      // ✨✨✨ 核心修复在这里 ✨✨✨
      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id) // <--- 只查我的！
        .order('created_at', { ascending: false })
        
      setEntries(data || [])
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Delete this memory?')) {
      await supabase.from('entries').delete().eq('id', id)
      fetchData()
    }
  }

  const handleEdit = async (entry: any) => {
    const newContent = prompt('Edit content:', entry.content)
    if (newContent && newContent !== entry.content) {
      await supabase.from('entries').update({ content: newContent }).eq('id', entry.id)
      fetchData()
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8">
      
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-gray-400 hover:text-gray-900"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-xl mx-auto">
        
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft size={18} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Journey</h1>
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">{entries.length} memories</p>
          </div>
        </div>

        <div className="relative border-l border-gray-200 ml-3 space-y-4 pb-20">
          {entries.map((entry) => {
            const lines = entry.content?.split('\n') || []
            const title = lines[0]?.length < 20 ? lines[0] : null
            const content = title ? lines.slice(1).join(' ') : entry.content
            const moodEmoji = moodEmojiMap[entry.mood] || null

            return (
              <div key={entry.id} className="relative pl-6 group">
                <div className={`absolute -left-[5px] top-5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${entry.mood === 'Joy' ? 'bg-yellow-400' : 'bg-gray-300'}`}></div>

                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex gap-3 relative group/card">
                  
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity z-20 bg-white/80 backdrop-blur rounded-lg p-1">
                     <button onClick={() => handleEdit(entry)} className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"><Edit2 size={12}/></button>
                     <button onClick={() => handleDelete(entry.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 size={12}/></button>
                  </div>

                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                           <span className="text-lg leading-none" title={entry.mood}>
                              {moodEmoji || <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{entry.mood}</span>}
                           </span>
                           {entry.meal_type && entry.meal_type !== 'Life' && (
                             <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{entry.meal_type}</span>
                           )}
                        </div>
                        <div className="text-[10px] text-gray-300 font-mono shrink-0">
                           {new Date(entry.created_at).toLocaleDateString()} • {new Date(entry.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                    {title && <h3 className="font-bold text-gray-800 text-sm mb-0.5 leading-tight truncate">{title}</h3>}
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-wrap line-clamp-3">
                      {content.replace('💭', '').trim()}
                    </p>
                  </div>

                  {entry.image_url && (
                    <div className="w-20 h-20 shrink-0 rounded-lg bg-gray-50 overflow-hidden cursor-zoom-in border border-gray-100 relative" onClick={() => setSelectedImage(entry.image_url)}>
                      <img src={entry.image_url} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
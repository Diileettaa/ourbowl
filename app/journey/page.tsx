'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X, Maximize2 } from 'lucide-react'

// 复用 Dashboard 的表情映射
const moodEmojiMap: Record<string, string> = {
  'Joy': '🥰', 'Calm': '🌿', 'Neutral': '😶', 'Tired': '😴', 'Stressed': '🤯',
  'Angry': '🤬', 'Crying': '😭', 'Excited': '🎉', 'Sick': '🤢', 'Proud': '😎', 'Love': '❤️'
}

export default function JourneyPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // 控制图片放大
  const router = useRouter()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/'); return }

      const { data } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
      
      setEntries(data || [])
    }
    getData()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8">
      
      {/* --- 图片全屏查看器 (Lightbox) --- */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-6 right-6 text-white/70 hover:text-white"><X size={32}/></button>
          <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain" />
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        
        {/* 顶部导航 */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Your Journey</h1>
            <p className="text-xs text-gray-400 font-mono">{entries.length} memories</p>
          </div>
        </div>

        {/* ⏳ 核心：紧凑时间轴列表 */}
        {/* 左侧的竖线 */}
        <div className="relative border-l-2 border-gray-200/60 ml-4 space-y-6 pb-20">
          
          {entries.map((entry) => {
            const lines = entry.content?.split('\n') || []
            // 智能判断：如果第一行很短(小于20字)，当做标题；否则全文当做内容
            const isTitle = lines[0]?.length < 20
            const title = isTitle ? lines[0] : null
            const content = isTitle ? lines.slice(1).join(' ') : entry.content

            const moodEmoji = moodEmojiMap[entry.mood] || null

            return (
              <div key={entry.id} className="relative pl-8 group">
                
                {/* 1. 时间轴节点 (Dot) */}
                {/* 放在左侧线条上，根据是否有图变色 */}
                <div className={`absolute -left-[7px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm z-10 transition-colors ${
                   entry.mood === 'Joy' ? 'bg-yellow-400' : 'bg-gray-300'
                }`}></div>

                {/* 2. 卡片本体 (更方、更紧凑、左文右图) */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex justify-between gap-4">
                  
                  {/* === 左侧：文字信息区 === */}
                  <div className="flex-1 flex flex-col min-w-0">
                    
                    {/* 顶部：心情 + 标签 (极简的一行) */}
                    <div className="flex items-center gap-2 mb-2">
                       {/* 心情 (优先 Emoji) */}
                       <div className="text-lg" title={entry.mood}>
                          {moodEmoji || <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">{entry.mood}</span>}
                       </div>
                       
                       {/* 餐点标签 (如果有) */}
                       {entry.meal_type && entry.meal_type !== 'Life' && (
                         <span className="text-[10px] font-bold uppercase text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                           {entry.meal_type}
                         </span>
                       )}
                    </div>

                    {/* 标题 (如果有) */}
                    {title && <h3 className="font-bold text-gray-800 text-base mb-1 leading-tight">{title}</h3>}
                    
                    {/* 正文 (允许换行，但字号适中) */}
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-3">
                      {content}
                    </p>

                    {/* 底部：极简日期 (压扁) */}
                    <div className="mt-auto pt-2 border-t border-gray-50 flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                       <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                       <span>{new Date(entry.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>

                  {/* === 右侧：图片区 (固定正方形，可点击) === */}
                  {entry.image_url && (
                    <div 
                      className="w-24 h-24 shrink-0 rounded-lg bg-gray-50 overflow-hidden cursor-zoom-in border border-gray-100 relative group/img"
                      onClick={() => setSelectedImage(entry.image_url)}
                    >
                      <img src={entry.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                      {/* 放大图标提示 */}
                      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                         <Maximize2 size={16} className="text-white drop-shadow-md" />
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )
          })}

          {entries.length === 0 && (
            <div className="pl-8 text-gray-400 text-sm italic">No journey recorded yet...</div>
          )}

        </div>
      </div>
    </div>
  )
}
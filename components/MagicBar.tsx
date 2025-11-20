'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Send, Camera, Image as ImageIcon, X, Plus, ChevronDown, ChevronUp, Mic } from 'lucide-react'
import CameraModal from './CameraModal'

export default function MagicBar() {
  const [isExpanded, setIsExpanded] = useState(false) // ✨ 控制展开/收起
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 表单数据
  const [content, setContent] = useState('')
  const [foodContent, setFoodContent] = useState('')
  const [mood, setMood] = useState('')
  const [mealType, setMealType] = useState('')
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- 配置保持不变 ---
  const meals = [
    { label: 'Breakfast', icon: '🍳' },
    { label: 'Lunch', icon: '🍱' },
    { label: 'Dinner', icon: '🍷' },
    { label: 'Snack', icon: '🍪' },
    { label: 'Coffee', icon: '☕' },
  ]
  const mainMoods = [
    { label: 'Joy', emoji: '🥰', color: 'bg-orange-100 text-orange-600' },
    { label: 'Calm', emoji: '🌿', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Neutral', emoji: '😶', color: 'bg-slate-100 text-slate-600' },
    { label: 'Tired', emoji: '😴', color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Stressed', emoji: '🤯', color: 'bg-rose-100 text-rose-600' },
  ]

  // --- 交互逻辑 ---
  const handleFocus = () => setIsExpanded(true)
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileObject(e.target.files[0])
  }
  const handleCameraCapture = (file: File) => setFileObject(file)
  
  const setFileObject = (file: File) => {
    setFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setIsExpanded(true) // 选图后自动展开
  }

  const handleSubmit = async () => {
    if (!foodContent && !content && !file) return
    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let imageUrl = null
      if (file) {
        const fileName = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`
        await supabase.storage.from('memories').upload(fileName, file)
        const { data } = supabase.storage.from('memories').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      let finalContent = foodContent
      if (content) finalContent += `\n\n${content}`

      await supabase.from('entries').insert({
        content: finalContent,
        mood, 
        image_url: imageUrl, 
        user_id: user.id,
        is_public: isPublic,
        meal_type: mealType
      })

      await supabase.from('pet_states').update({ last_fed_at: new Date().toISOString() }).eq('user_id', user.id)
      window.location.reload()
    } catch (e) {
      alert('Error')
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {isCameraOpen && <CameraModal onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}

      {/* 容器：宽度限制，居中 */}
      <div className="w-full max-w-2xl mx-auto">
        
        {/* 主卡片：纯白背景，极简阴影 */}
        <div className={`bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'p-5' : 'p-3'}`}>
          
          {/* 1. 收起状态 (极简模式) */}
          {!isExpanded && (
            <div className="flex items-center gap-3">
               {/* 相机按钮 */}
               <button 
                 onClick={() => setIsCameraOpen(true)}
                 className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-blue-50 hover:text-blue-500 transition-colors"
               >
                 <Camera size={20} />
               </button>
               
               {/* 伪输入框，点击展开 */}
               <div 
                 onClick={handleFocus}
                 className="flex-1 h-12 bg-gray-50 rounded-2xl flex items-center px-4 text-gray-400 cursor-text text-sm font-medium"
               >
                 Record your meal or mood...
               </div>
            </div>
          )}

          {/* 2. 展开状态 (完整模式) */}
          {isExpanded && (
            <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* 顶部：收起按钮 */}
              <div className="flex justify-between items-center">
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Record</span>
                 <button onClick={() => setIsExpanded(false)} className="p-1 bg-gray-50 rounded-full text-gray-400 hover:bg-gray-100">
                    <ChevronUp size={16} />
                 </button>
              </div>

              {/* 图片预览区 (如果有图) */}
              {previewUrl && (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden group">
                  <img src={previewUrl} className="w-full h-full object-cover" />
                  <button onClick={() => {setFile(null); setPreviewUrl(null)}} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full">
                    <X size={14}/>
                  </button>
                </div>
              )}

              {/* 餐点选择 */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {meals.map(m => (
                  <button
                    key={m.label}
                    onClick={() => setMealType(mealType === m.label ? '' : m.label)}
                    className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      mealType === m.label ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-100'
                    }`}
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>

              {/* 核心输入框 */}
              <div className="space-y-3">
                <input 
                  autoFocus
                  value={foodContent}
                  onChange={e => setFoodContent(e.target.value)}
                  placeholder="What did you eat?"
                  className="w-full text-xl font-bold text-gray-800 placeholder-gray-300 outline-none bg-transparent"
                />
                <textarea 
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Add details... (calories, thoughts)"
                  className="w-full h-20 text-sm text-gray-600 placeholder-gray-300 outline-none bg-transparent resize-none"
                />
              </div>

              {/* 心情选择 */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {mainMoods.map(m => (
                  <button
                    key={m.label}
                    onClick={() => setMood(m.label)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      mood === m.label ? m.color : 'bg-gray-50 text-gray-400 grayscale'
                    }`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>

              {/* 底部工具栏 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                 <div className="flex gap-2">
                    <button onClick={() => setIsCameraOpen(true)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><Camera size={20}/></button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden"/>
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl"><ImageIcon size={20}/></button>
                 </div>
                 <button 
                   onClick={handleSubmit}
                   disabled={isSubmitting}
                   className="bg-[#F5C066] hover:bg-[#E0A845] text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 transition-all active:scale-95"
                 >
                   {isSubmitting ? 'Saving...' : 'Save Record'}
                 </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  )
}
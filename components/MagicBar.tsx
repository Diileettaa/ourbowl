'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Send, Camera, Image as ImageIcon, X, Plus, Globe, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import CameraModal from './CameraModal'

export default function MagicBar() {
  // --- 状态管理 ---
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [content, setContent] = useState('') // 碎碎念
  const [foodContent, setFoodContent] = useState('') // 吃了什么
  
  const [mood, setMood] = useState('')
  const [customMood, setCustomMood] = useState('')
  const [showOtherMoods, setShowOtherMoods] = useState(false)
  
  const [mealType, setMealType] = useState('') // 早餐/午餐...
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(false)
  const [isPhotoExpanded, setIsPhotoExpanded] = useState(false) // 控制照片区展开

  const fileInputRef = useRef<HTMLInputElement>(null)

  // --- 配置数据 (改用真 Emoji) ---
  const meals = [
    { label: 'Breakfast', icon: '🍳' },
    { label: 'Lunch', icon: '🍱' },
    { label: 'Dinner', icon: '🍷' },
    { label: 'Snack', icon: '🍪' },
    { label: 'Coffee', icon: '☕' },
  ]

  const mainMoods = [
    { label: 'Joy', emoji: '🥰' },
    { label: 'Calm', emoji: '🌿' },
    { label: 'Neutral', emoji: '😶' },
    { label: 'Tired', emoji: '😴' },
    { label: 'Stressed', emoji: '🤯' },
  ]

  const otherMoods = [
    { label: 'Angry', emoji: '🤬' },
    { label: 'Crying', emoji: '😭' },
    { label: 'Excited', emoji: '🎉' },
    { label: 'Sick', emoji: '🤢' },
    { label: 'Proud', emoji: '😎' },
  ]

  // --- 处理文件 ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileObject(e.target.files[0])
    }
  }
  const handleCameraCapture = (capturedFile: File) => {
    setFileObject(capturedFile)
  }
  const setFileObject = (file: File) => {
    setFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setIsPhotoExpanded(true) // 有图时自动展开
  }

  // --- 提交逻辑 ---
  const handleSubmit = async () => {
    if (!foodContent && !content && !mood && !file) return alert('Please record something...')
    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user')

      // 1. 上传图片
      let imageUrl = null
      if (file) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        await supabase.storage.from('memories').upload(fileName, file)
        const { data } = supabase.storage.from('memories').getPublicUrl(fileName)
        imageUrl = data.publicUrl
      }

      // 2. 组合数据
      // 如果用户在两个框都写了字，我们把它拼起来存，或者你也可以只存一个
      // 这里演示：把【食物】作为重点，【碎碎念】跟在后面
      let finalContent = foodContent
      if (content) finalContent += `\n\n💭 ${content}`

      const finalMood = customMood.trim() ? customMood : mood
      
      const { error } = await supabase.from('entries').insert({
        content: finalContent,
        mood: finalMood, 
        image_url: imageUrl, 
        user_id: user.id,
        is_public: isPublic,
        meal_type: mealType // 存入刚加的列
      })

      if (error) throw error

      // 3. 喂宠物
      await supabase.from('pet_states').update({ last_fed_at: new Date().toISOString() }).eq('user_id', user.id)
      
      window.location.reload()
    } catch (err: any) {
      alert(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {isCameraOpen && <CameraModal onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}

      <div className="w-full max-w-3xl mx-auto">
        {/* 主卡片：玻璃拟态 + 渐变边框 */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/50 overflow-hidden relative group transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
          
          {/* --- 1. 顶部：照片触发区 (可伸缩) --- */}
          <div 
            className={`relative w-full bg-gray-50 border-b border-gray-100 transition-all duration-500 ease-in-out ${previewUrl ? 'h-64' : 'h-12 hover:bg-gray-100 cursor-pointer'}`}
          >
            {previewUrl ? (
              // 有照片时的展示状态 (Cover Image)
              <>
                <img src={previewUrl} className="w-full h-full object-cover" alt="Meal" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end justify-end p-4">
                  <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                    className="bg-white/20 backdrop-blur text-white px-3 py-1 rounded-full text-xs hover:bg-red-500/80 transition-colors"
                  >
                    Remove Photo
                  </button>
                </div>
              </>
            ) : (
              // 没照片时的折叠状态 (点击展开)
              <div className="flex items-center justify-center h-full gap-4 text-gray-400 text-sm"
                   onClick={() => setIsPhotoExpanded(!isPhotoExpanded)}>
                  <Camera size={16} />
                  <span>Add a photo of your meal (Optional)</span>
              </div>
            )}

            {/* 隐藏的展开面板：点击上面条条展开，显示相机/相册按钮 */}
            {!previewUrl && isPhotoExpanded && (
               <div className="absolute top-12 left-0 right-0 bg-white p-4 flex justify-center gap-8 border-b border-gray-100 z-10 shadow-sm animate-in slide-in-from-top-2">
                  <button onClick={() => setIsCameraOpen(true)} className="flex flex-col items-center gap-2 text-gray-500 hover:text-blue-500">
                    <div className="p-3 bg-blue-50 rounded-full"><Camera size={24} /></div>
                    <span className="text-xs">Camera</span>
                  </button>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-2 text-gray-500 hover:text-green-500">
                    <div className="p-3 bg-green-50 rounded-full"><ImageIcon size={24} /></div>
                    <span className="text-xs">Gallery</span>
                  </button>
                  <button onClick={() => setIsPhotoExpanded(false)} className="absolute top-2 right-2 text-gray-300"><X size={16}/></button>
               </div>
            )}
          </div>

          <div className="p-6 space-y-6">
            
            {/* --- 2. 饮食类型选择 (Pill Selectors) --- */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">1. What meal is it?</label>
              <div className="flex flex-wrap gap-2">
                {meals.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setMealType(mealType === m.label ? '' : m.label)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                      mealType === m.label 
                      ? 'bg-gray-800 text-white border-gray-800 shadow-lg scale-105' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1">{m.icon}</span> {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* --- 3. 食物描述框 (重点) --- */}
            <div className="space-y-2">
               <input 
                 type="text" 
                 value={foodContent}
                 onChange={(e) => setFoodContent(e.target.value)}
                 placeholder="I ate..."
                 className="w-full text-2xl font-medium text-gray-800 placeholder-gray-300 border-b-2 border-gray-100 focus:border-yellow-400 focus:outline-none py-2 bg-transparent transition-colors"
               />
            </div>

            {/* --- 4. 情绪选择 (真Emoji) --- */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">2. How do you feel?</label>
                <button onClick={() => setShowOtherMoods(!showOtherMoods)} className="text-xs text-blue-400 hover:text-blue-600">
                  {showOtherMoods ? 'Show Less' : 'More Moods'}
                </button>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {mainMoods.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => { setMood(m.label); setCustomMood(''); }}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all ${
                      mood === m.label 
                      ? 'bg-yellow-50 border-yellow-400 shadow-md scale-110' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300 grayscale hover:grayscale-0'
                    }`}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] mt-1">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* 更多情绪面板 */}
              {showOtherMoods && (
                <div className="grid grid-cols-5 gap-3 pt-2 animate-in fade-in">
                   {otherMoods.map((m) => (
                    <button
                      key={m.label}
                      onClick={() => { setMood(m.label); setCustomMood(''); }}
                      className={`flex flex-col items-center justify-center w-14 h-14 rounded-2xl border transition-all ${
                        mood === m.label ? 'bg-purple-50 border-purple-400 shadow-md' : 'bg-white border-gray-100 grayscale hover:grayscale-0'
                      }`}
                    >
                      <span className="text-2xl">{m.emoji}</span>
                      <span className="text-[10px] mt-1">{m.label}</span>
                    </button>
                  ))}
                </div>
              )}
              
              {/* 自定义情绪输入 */}
              <input 
                  type="text"
                  placeholder="Or type exact feeling..."
                  value={customMood}
                  onChange={(e) => { setCustomMood(e.target.value); setMood(''); }}
                  className="w-full text-sm px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-yellow-100 transition-all mt-2"
              />
            </div>

            {/* --- 5. 碎碎念 (次要输入) --- */}
            <div className="pt-2">
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Any other thoughts? (Optional)"
                className="w-full h-20 text-sm text-gray-600 placeholder-gray-300 bg-gray-50/50 p-4 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-gray-100 resize-none transition-all"
              />
            </div>

            {/* --- 6. 底部栏 --- */}
            <div className="flex items-center justify-between pt-2">
               <button 
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isPublic 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                {isPublic ? 'Public' : 'Private'}
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg shadow-gray-300 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Record Meal'} <Send size={16} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/utils/supabase/client'
import { Send, Camera, Image as ImageIcon, X, ChevronUp, Utensils, Sparkles, PenLine, AlignLeft, Globe, Lock, Plus } from 'lucide-react'
import CameraModal from './CameraModal'
import { useProfile } from '@/context/ProfileContext'

export default function MagicBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordMode, setRecordMode] = useState<'food' | 'life'>('food')
  const { currentProfile } = useProfile()

  const [content, setContent] = useState('')
  const [foodContent, setFoodContent] = useState('')
  const [mood, setMood] = useState('')
  const [mealType, setMealType] = useState('')
  const [customMood, setCustomMood] = useState('')
  const [showOtherMoods, setShowOtherMoods] = useState(false)
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isPublic, setIsPublic] = useState(false) // ✨ 找回了这个状态

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ... (Emoji 配置保持不变) ...
  const meals = [
    { label: 'Breakfast', icon: '🍳' },
    { label: 'Lunch', icon: '🍱' },
    { label: 'Dinner', icon: '🍷' },
    { label: 'Snack', icon: '🍪' },
    { label: 'Coffee', icon: '☕' },
  ]
  const mainMoods = [
    { label: 'Joy', emoji: '🥰', color: 'bg-orange-100 border-orange-200 text-orange-700' },
    { label: 'Calm', emoji: '🌿', color: 'bg-emerald-100 border-emerald-200 text-emerald-700' },
    { label: 'Neutral', emoji: '😶', color: 'bg-slate-100 border-slate-200 text-slate-700' },
    { label: 'Tired', emoji: '😴', color: 'bg-indigo-100 border-indigo-200 text-indigo-700' },
    { label: 'Stressed', emoji: '🤯', color: 'bg-rose-100 border-rose-200 text-rose-700' },
  ]
  const otherMoods = [
    { label: 'Angry', emoji: '🤬' },
    { label: 'Crying', emoji: '😭' },
    { label: 'Excited', emoji: '🎉' },
    { label: 'Sick', emoji: '🤢' },
    { label: 'Proud', emoji: '😎' },
    { label: 'Love', emoji: '❤️' },
  ]

  const handleFocus = () => setIsExpanded(true)
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFileObject(e.target.files[0])
  }
  const handleCameraCapture = (file: File) => setFileObject(file)
  
  const setFileObject = (file: File) => {
    setFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setIsExpanded(true)
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

      let finalContent = content
      if (recordMode === 'food' && foodContent) {
        finalContent = `${foodContent}\n${content}`
      }

      const finalMood = customMood.trim() ? customMood : mood
      
      await supabase.from('entries').insert({
        content: finalContent.trim(),
        mood: finalMood, 
        image_url: imageUrl, 
        user_id: user.id,
        is_public: isPublic, // ✨ 提交时带上 is_public
        meal_type: recordMode === 'food' ? mealType : 'Life',
        profile_id: currentProfile?.id
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

      <div className="w-full max-w-2xl mx-auto relative z-50">
        <div className={`bg-white rounded-[24px] shadow-clay border border-white transition-all duration-300 ease-out overflow-hidden ${isExpanded ? 'p-5' : 'p-3'}`}>
          
          {!isExpanded && (
            <div className="flex items-center gap-3">
               <button onClick={() => setIsCameraOpen(true)} className="p-3 bg-gray-50 text-gray-500 rounded-2xl hover:bg-blue-50 hover:text-blue-500 transition-colors">
                 <Camera size={20} />
               </button>
               <div onClick={handleFocus} className="flex-1 h-12 bg-gray-50 rounded-2xl flex items-center px-4 text-gray-400 cursor-text text-sm font-medium group hover:bg-gray-100 transition-colors">
                 <span className="group-hover:text-gray-600 transition-colors">
                   {recordMode === 'food' ? "Record your meal..." : "Record a moment..."}
                 </span>
               </div>
               <button onClick={() => setRecordMode(recordMode === 'food' ? 'life' : 'food')} className={`p-3 rounded-2xl transition-colors ${recordMode === 'food' ? 'bg-orange-50 text-orange-500' : 'bg-purple-50 text-purple-500'}`}>
                 {recordMode === 'food' ? <Utensils size={20}/> : <Sparkles size={20}/>}
               </button>
            </div>
          )}

          {isExpanded && (
            <div className="flex gap-4">
              <div className="flex-1 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                     {recordMode === 'food' ? 'New Food Log' : 'New Life Log'}
                   </span>
                   <button onClick={() => setIsExpanded(false)} className="p-1 text-gray-300 hover:bg-gray-100 rounded-full transition-colors"><ChevronUp size={18}/></button>
                </div>

                {previewUrl && (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden group border border-gray-100">
                    <img src={previewUrl} className="w-full h-full object-cover" />
                    <button onClick={() => {setFile(null); setPreviewUrl(null)}} className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"><X size={14}/></button>
                  </div>
                )}

                {recordMode === 'food' && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {meals.map(m => (
                      <button key={m.label} onClick={() => setMealType(mealType === m.label ? '' : m.label)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${mealType === m.label ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:bg-gray-50'}`}>
                        <span>{m.icon}</span> {m.label}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {recordMode === 'food' && (
                    <div className="relative group">
                      <div className="absolute top-3 left-3 text-gray-400"><PenLine size={18}/></div>
                      <input autoFocus value={foodContent} onChange={e => setFoodContent(e.target.value)} placeholder="What did you eat?" className="w-full pl-10 pr-4 py-3 text-lg font-bold text-gray-800 placeholder-gray-300 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all" />
                    </div>
                  )}
                  <div className="relative">
                     <div className="absolute top-3 left-3 text-gray-400"><AlignLeft size={18}/></div>
                     <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={recordMode === 'food' ? "Details (calories, taste, price)..." : "What's on your mind?"} className={`w-full pl-10 pr-4 py-3 text-sm text-gray-600 placeholder-gray-300 bg-gray-50/50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-100 outline-none resize-none transition-all ${recordMode === 'life' ? 'h-32 text-base' : 'h-20'}`} />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Mood</label>
                   <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {mainMoods.map(m => (
                      <button key={m.label} onClick={() => setMood(m.label)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${mood === m.label ? `${m.color} shadow-sm scale-105` : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}>
                        <span className="text-base">{m.emoji}</span>{m.label}
                      </button>
                    ))}
                    <button onClick={() => setShowOtherMoods(!showOtherMoods)} className="px-3 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">+</button>
                  </div>
                </div>
                
                {showOtherMoods && (
                   <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-top-1">
                      {otherMoods.map(m => (
                        <button key={m.label} type="button" onClick={() => { setMood(m.label); setCustomMood(''); }} className={`px-3 py-1.5 bg-white rounded-lg text-xs font-medium border shadow-sm transition-all hover:scale-105 ${mood === m.label ? 'border-purple-400 text-purple-600 ring-1 ring-purple-100' : 'border-gray-100 text-gray-600 hover:border-gray-300'}`}>
                          {m.emoji} {m.label}
                        </button>
                      ))}
                      <input placeholder="Type custom mood..." value={customMood} onChange={e => {setCustomMood(e.target.value); setMood('')}} className="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-purple-400 min-w-[100px]" />
                   </div>
                )}

                <div className="flex items-center justify-between pt-2">
                   <div className="flex gap-1 items-center">
                      <button onClick={() => setIsCameraOpen(true)} className="p-2.5 text-gray-400 hover:bg-blue-50 hover:text-blue-500 rounded-xl transition-colors"><Camera size={20}/></button>
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden"/>
                      <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-gray-400 hover:bg-green-50 hover:text-green-500 rounded-xl transition-colors"><ImageIcon size={20}/></button>
                      
                      {/* ✨ 公开开关加回来了 ✨ */}
                      <div className="h-6 w-px bg-gray-200 mx-1"></div>
                      <button onClick={() => setIsPublic(!isPublic)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isPublic ? 'bg-green-50 border-green-200 text-green-600' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                         {isPublic ? <Globe size={14}/> : <Lock size={14}/>}
                         {isPublic ? 'Public' : 'Private'}
                      </button>
                   </div>
                   <button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#F5C066] hover:bg-[#E0A845] text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center gap-2">
                     {isSubmitting ? 'Saving...' : 'Save'} <Send size={16} />
                   </button>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="w-10 flex flex-col gap-3 pt-8">
                 <button onClick={() => setRecordMode('food')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${recordMode === 'food' ? 'bg-gray-900 text-white ring-2 ring-offset-2 ring-gray-900' : 'bg-white text-gray-300 hover:text-gray-500 hover:bg-gray-50 border border-gray-100'}`}><Utensils size={18} /></button>
                 <button onClick={() => setRecordMode('life')} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm ${recordMode === 'life' ? 'bg-purple-500 text-white ring-2 ring-offset-2 ring-purple-500' : 'bg-white text-gray-300 hover:text-gray-500 hover:bg-gray-50 border border-gray-100'}`}><Sparkles size={18} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
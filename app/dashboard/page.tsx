import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MagicBar from '@/components/MagicBar'
import PetMochi from '@/components/PetMochi'

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/')

  const { data: pet } = await supabase.from('pet_states').select('*').eq('user_id', user.id).single()
  const { data: entries } = await supabase.from('entries').select('*').order('created_at', { ascending: false })

  return (
    // 1. 背景色：参考 FitoApp，用非常淡的灰米色，不再是死白
    <div className="min-h-screen bg-[#F5F7FA] pb-20">
      
      {/* 顶部背景装饰 (让头部不那么单调) */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-[#FFFBF0] to-transparent z-0"></div>

      <div className="max-w-2xl mx-auto px-6 pt-12 relative z-10">
        
        {/* 顶部：极简 Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">Hello, Owner</h1>
            <p className="text-xs text-gray-400 font-medium mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <Link href="/exploration" className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-xl shadow-lg active:scale-95 transition-transform">
            🪐
          </Link>
        </div>

        {/* 宠物卡片：参考 Moodji，做成一个小部件 */}
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-white mb-10 flex items-center justify-between">
           <div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pet Status</div>
              <h2 className="text-lg font-bold text-gray-800">Mochi is {pet ? 'Active' : 'Waiting'}</h2>
              <p className="text-xs text-gray-400 mt-1">Level 1 • Baby Phase</p>
           </div>
           <div className="w-24 h-24 -my-4">
              {pet ? <PetMochi lastFedAt={pet.last_fed_at} /> : <div className="text-2xl">🥚</div>}
           </div>
        </div>

        {/* 输入框 (不再 sticky，让它随页面滚动) */}
        <div className="mb-12">
           <MagicBar />
        </div>

        {/* 列表标题 */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Meals</h3>
          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">Today</span>
        </div>

        {/* 瀑布流列表：参考 FitoApp/小红书 */}
        <div className="grid gap-6">
          {entries && entries.length > 0 ? (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white p-0 rounded-[28px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                
                {/* 如果有图，图片占满顶部 */}
                {entry.image_url && (
                  <div className="w-full h-56 bg-gray-100 relative">
                    <img src={entry.image_url} className="w-full h-full object-cover" />
                    {/* 图片上的标签 */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                       {entry.meal_type || 'Moment'}
                    </div>
                  </div>
                )}

                <div className="p-6">
                   {/* 如果没图，标签显示在这里 */}
                   {!entry.image_url && (
                      <div className="flex gap-2 mb-3">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
                          {entry.meal_type || 'Note'}
                        </span>
                        {entry.mood && (
                          <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-xs font-bold">
                            Mood: {entry.mood}
                          </span>
                        )}
                      </div>
                   )}

                   <p className="text-gray-800 text-lg font-medium leading-relaxed mb-2">
                     {entry.content}
                   </p>
                   
                   <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <span className="text-xs text-gray-400 font-mono">
                        {new Date(entry.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      {/* 抱抱按钮占位 */}
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                      </div>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
               <div className="text-4xl mb-4 opacity-50">🍽️</div>
               <p className="text-gray-400 text-sm">No meals recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
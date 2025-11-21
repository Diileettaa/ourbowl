import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ParkFeed from '@/components/ParkFeed'

export default async function ParkPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // 获取帖子 + 抱抱数 + 评论数
  const { data: posts } = await supabase
    .from('entries')
    .select('*, hugs(count), comments(count)') 
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(50)

  const isEmpty = !posts || posts.length === 0

  return (
    // 背景改成纯白，和其他页面统一
    <div className="min-h-screen bg-white pb-20">
      
      {/* 顶部导航栏 (纯白) */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
         <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                <ArrowLeft size={18} className="text-gray-600" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-800">The Park</h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Anonymous Community</p>
              </div>
            </div>
         </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6">
        
        {/* 🌲 只有在没帖子时才显示的欢迎树 🌲 */}
        {isEmpty && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-[32px] border border-green-100 text-center animate-in fade-in">
             <div className="text-6xl mb-4">🌳</div>
             <h2 className="text-green-800 font-bold mb-2">The Forest is Quiet</h2>
             <p className="text-green-600/70 text-sm max-w-xs mx-auto">
               Be the first one to plant a memory here.
             </p>
          </div>
        )}

        <ParkFeed initialPosts={posts || []} currentUserId={user.id} />

      </div>
    </div>
  )
}
//反馈去哪看？（Admin 后台）
// 发邮件确实不稳定。最好的办法是存数据库，然后做一个只有你能进的“管理员页面”。
// 安全问题：非常安全！我们会在代码里写死：“只有邮箱是 ye182934@gmail.com 的人才能看这个页面”，其他人进都会被踢出去。
//supabase SQL 里面写的也是这个邮箱
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Trash2, Mail, AlertTriangle } from 'lucide-react'

export default function AdminPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ⚠️ 管理员邮箱 (必须和你登录的邮箱一致)
  const ADMIN_EMAIL = 'ye182934@gmail.com'

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      // 1. 安全检查：如果你不是管理员，直接踢回首页
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push('/')
        return
      }

      // 2. 获取反馈
      const { data: feedData } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
      setFeedbacks(feedData || [])

      // 3. 获取举报 (关联查询帖子内容)
      const { data: reportData } = await supabase
        .from('reports')
        .select('*, entries(content, image_url)')
        .order('created_at', { ascending: false })
      setReports(reportData || [])

      setLoading(false)
    }
    checkAdminAndFetch()
  }, [])

  // 删除恶意帖子
  const deleteEntry = async (entryId: string) => {
    if (confirm('Delete this post permanently?')) {
      await supabase.from('entries').delete().eq('id', entryId)
      window.location.reload()
    }
  }

  if (loading) return <div className="p-10 text-center">Checking ID...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <h1 className="text-3xl font-black text-gray-900">👮‍♂️ Admin Dashboard</h1>

        {/* --- 板块 1: 用户反馈 --- */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="text-blue-500"/> User Feedback ({feedbacks.length})
          </h2>
          <div className="grid gap-4">
            {feedbacks.map(f => (
              <div key={f.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-gray-800 font-medium mb-2">{f.content}</p>
                <div className="text-xs text-gray-400 flex justify-between">
                   <span>Contact: {f.contact_info || 'None'}</span>
                   <span>{new Date(f.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && <p className="text-gray-400">No feedback yet.</p>}
          </div>
        </div>

        {/* --- 板块 2: 被举报的帖子 --- */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-red-500"/> Reported Posts ({reports.length})
          </h2>
          <div className="grid gap-4">
            {reports.map(r => (
              <div key={r.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex justify-between items-start">
                <div>
                  <p className="text-xs text-red-400 font-bold uppercase mb-1">Reported Content:</p>
                  <p className="text-gray-800 mb-2 bg-gray-50 p-2 rounded">
                    {r.entries?.content || '[Content Deleted]'}
                  </p>
                  <p className="text-xs text-gray-400">Reported at: {new Date(r.created_at).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => deleteEntry(r.entry_id)}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600"
                >
                  Delete Post
                </button>
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-400">No reports. Community is safe.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Send, MoreHorizontal, Flag, AlertTriangle } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { getAnonymousIdentity } from '@/utils/getAnonymousIdentity'
import { motion, AnimatePresence } from 'framer-motion'

export default function ParkFeed({ initialPosts, currentUserId }: { initialPosts: any[], currentUserId: string }) {
  const [posts, setPosts] = useState(initialPosts)
  const [huggingIds, setHuggingIds] = useState<Set<string>>(new Set())
  
  const [openCommentId, setOpenCommentId] = useState<string | null>(null)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  
  // ✨ 新增：控制举报菜单的打开状态 (存的是 post.id)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  const handleHug = async (entryId: string) => {
    if (huggingIds.has(entryId)) return 
    setHuggingIds(prev => new Set(prev).add(entryId))
    setPosts(current => 
      current.map(p => p.id === entryId ? { ...p, hugs: [{ count: (p.hugs[0]?.count || 0) + 1 }] } : p)
    )
    await supabase.from('hugs').insert({ entry_id: entryId, user_id: currentUserId })
  }

  const toggleComments = async (entryId: string) => {
    if (openCommentId === entryId) {
      setOpenCommentId(null)
    } else {
      setOpenCommentId(entryId)
      setLoadingComments(true)
      const { data } = await supabase.from('comments').select('*').eq('entry_id', entryId).order('created_at', { ascending: true })
      setComments(data || [])
      setLoadingComments(false)
    }
  }

  const sendComment = async (entryId: string) => {
    if (!newComment.trim()) return
    const tempComment = { id: Date.now(), content: newComment, user_id: currentUserId, created_at: new Date().toISOString() }
    setComments([...comments, tempComment])
    setNewComment('')
    await supabase.from('comments').insert({ content: tempComment.content, entry_id: entryId, user_id: currentUserId })
  }

  // ✨ 新增：举报逻辑
  const handleReport = async (entryId: string) => {
    if (confirm('Report this post as inappropriate?')) {
      await supabase.from('reports').insert({ entry_id: entryId, user_id: currentUserId })
      alert('Thanks for reporting. We will review it.')
      setMenuOpenId(null)
    }
  }

  return (
    <div className="columns-1 md:columns-2 gap-3 space-y-3">
      {posts.map((post) => {
        const identity = getAnonymousIdentity(post.user_id)
        const hugCount = post.hugs[0]?.count || 0
        const isJustHugged = huggingIds.has(post.id)
        const isCommentOpen = openCommentId === post.id
        const isMenuOpen = menuOpenId === post.id

        return (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="break-inside-avoid bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all mb-3 relative"
            onMouseLeave={() => setMenuOpenId(null)} // 鼠标移开自动关闭菜单
          >
            {/* 图片 */}
            {post.image_url && (
              <div className="rounded-xl overflow-hidden mb-3">
                 <img src={post.image_url} className="w-full h-auto object-cover" />
              </div>
            )}

            {/* 头部 */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm ${identity.color}`}>
                  {identity.icon}
                </div>
                <p className="text-xs font-bold text-gray-600 truncate max-w-[80px]">{identity.name}</p>
              </div>
              <span className="text-[10px] bg-gray-50 px-2 py-0.5 rounded text-gray-400 uppercase">
                {post.mood}
              </span>
            </div>

            {/* 内容 */}
            <p className="text-gray-800 text-sm leading-relaxed font-medium mb-3">
              {post.content}
            </p>

            {/* 底部栏 */}
            <div className="flex justify-between items-center pt-3 border-t border-gray-50 relative">
               
               {/* ✨ 举报菜单区域 ✨ */}
               <div className="relative">
                 <button onClick={() => setMenuOpenId(isMenuOpen ? null : post.id)} className="text-gray-300 hover:text-gray-600 p-1 rounded transition-colors">
                   <MoreHorizontal size={16}/>
                 </button>
                 
                 {isMenuOpen && (
                   <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-100 shadow-xl rounded-xl overflow-hidden w-32 z-10 animate-in fade-in zoom-in-95">
                      <button 
                        onClick={() => handleReport(post.id)}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Flag size={12}/> Report
                      </button>
                   </div>
                 )}
               </div>

               <div className="flex gap-3">
                 <button onClick={() => toggleComments(post.id)} className="text-gray-400 hover:text-blue-500 transition-colors flex items-center gap-1">
                   <MessageCircle size={16} />
                 </button>
                 <button 
                   onClick={() => handleHug(post.id)}
                   disabled={isJustHugged}
                   className={`flex items-center gap-1 transition-all ${isJustHugged ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
                 >
                   <Heart size={16} fill={isJustHugged ? "currentColor" : "none"} />
                   <span className="text-xs font-bold">{hugCount}</span>
                 </button>
               </div>
            </div>

            {/* 评论区 */}
            <AnimatePresence>
              {isCommentOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="bg-gray-50 rounded-xl p-3 mt-3 space-y-2">
                    {comments.map(c => {
                       const cIdentity = getAnonymousIdentity(c.user_id)
                       return (
                         <div key={c.id} className="flex gap-2 items-start text-xs">
                            <span className="mt-1">{cIdentity.icon}</span>
                            <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm border border-gray-100 flex-1">
                              <p className="text-gray-800">{c.content}</p>
                            </div>
                         </div>
                       )
                    })}
                    <div className="flex gap-2 mt-2">
                      <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Say something nice..." className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100" onKeyDown={e => e.key === 'Enter' && sendComment(post.id)} />
                      <button onClick={() => sendComment(post.id)} className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"><Send size={12}/></button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )
      })}
    </div>
  )
}
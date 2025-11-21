'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'
import { supabase } from '@/utils/supabase/client'
import { getAnonymousIdentity } from '@/utils/getAnonymousIdentity'
import { motion, AnimatePresence } from 'framer-motion'

export default function ParkFeed({ initialPosts, currentUserId }: { initialPosts: any[], currentUserId: string }) {
  const [posts, setPosts] = useState(initialPosts)
  const [huggingIds, setHuggingIds] = useState<Set<string>>(new Set())
  
  // 评论相关的状态
  const [openCommentId, setOpenCommentId] = useState<string | null>(null) // 当前打开评论的帖子ID
  const [comments, setComments] = useState<any[]>([]) // 当前帖子的评论列表
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  // --- 抱抱逻辑 (修复了乱跳问题) ---
  const handleHug = async (entryId: string) => {
    if (huggingIds.has(entryId)) return 
    
    setHuggingIds(prev => new Set(prev).add(entryId))
    setPosts(current => 
      current.map(p => p.id === entryId ? { ...p, hugs: [{ count: (p.hugs[0]?.count || 0) + 1 }] } : p)
    )

    await supabase.from('hugs').insert({ entry_id: entryId, user_id: currentUserId })
  }

  // --- 评论逻辑 ---
  const toggleComments = async (entryId: string) => {
    if (openCommentId === entryId) {
      setOpenCommentId(null) // 关闭
    } else {
      setOpenCommentId(entryId) // 打开
      setLoadingComments(true)
      // 获取评论
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('entry_id', entryId)
        .order('created_at', { ascending: true })
      setComments(data || [])
      setLoadingComments(false)
    }
  }

  const sendComment = async (entryId: string) => {
    if (!newComment.trim()) return
    
    // 乐观更新 UI
    const tempComment = {
      id: Date.now(), 
      content: newComment, 
      user_id: currentUserId,
      created_at: new Date().toISOString() 
    }
    setComments([...comments, tempComment])
    setNewComment('')

    // 发送
    await supabase.from('comments').insert({
      content: tempComment.content,
      entry_id: entryId,
      user_id: currentUserId
    })
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post) => {
        const identity = getAnonymousIdentity(post.user_id)
        const hugCount = post.hugs[0]?.count || 0
        const commentCount = post.comments?.[0]?.count || 0 // 这里可能需要后端配合，暂时先不显示数字
        const isJustHugged = huggingIds.has(post.id)
        const isCommentOpen = openCommentId === post.id

        return (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col gap-4"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${identity.color}`}>
                  {identity.icon}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-700">{identity.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-gray-50 px-2 py-1 rounded text-gray-400 uppercase">{post.mood}</span>
            </div>

            {/* Content */}
            <div>
               <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium">{post.content}</p>
               {post.image_url && (
                 <div className="mt-3 rounded-xl overflow-hidden aspect-video bg-gray-50">
                    <img src={post.image_url} className="w-full h-full object-cover" />
                 </div>
               )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-gray-50 flex justify-end items-center gap-3">
               {/* 评论按钮 */}
               <button 
                 onClick={() => toggleComments(post.id)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isCommentOpen ? 'bg-blue-50 text-blue-500' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
               >
                 <MessageCircle size={16} />
                 <span className="text-xs font-bold">Comment</span>
               </button>

               {/* 抱抱按钮 (去掉了 animate-bounce，只在点击瞬间缩放) */}
               <button 
                 onClick={() => handleHug(post.id)}
                 disabled={isJustHugged}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all active:scale-90 ${
                    isJustHugged 
                    ? 'bg-pink-50 text-pink-500' 
                    : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-400'
                 }`}
               >
                 <Heart size={16} fill={isJustHugged ? "currentColor" : "none"} />
                 <span className="text-xs font-bold">{hugCount}</span>
               </button>
            </div>

            {/* 评论区 (折叠展开) */}
            <AnimatePresence>
              {isCommentOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-gray-50 rounded-2xl p-4 mt-2 space-y-3">
                    {loadingComments ? (
                      <div className="text-center text-xs text-gray-400">Loading...</div>
                    ) : comments.length > 0 ? (
                      comments.map(c => {
                         const cIdentity = getAnonymousIdentity(c.user_id)
                         return (
                           <div key={c.id} className="flex gap-2 items-start text-xs">
                              <span className="mt-0.5">{cIdentity.icon}</span>
                              <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm border border-gray-100">
                                <p className="text-gray-800">{c.content}</p>
                              </div>
                           </div>
                         )
                      })
                    ) : (
                      <div className="text-center text-xs text-gray-400 italic">No comments yet. Say hi!</div>
                    )}

                    {/* 输入框 */}
                    <div className="flex gap-2 mt-2">
                      <input 
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        placeholder="Write a warm comment..."
                        className="flex-1 bg-white border border-gray-200 rounded-full px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100"
                        onKeyDown={e => e.key === 'Enter' && sendComment(post.id)}
                      />
                      <button 
                        onClick={() => sendComment(post.id)}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 active:scale-95"
                      >
                        <Send size={14} />
                      </button>
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
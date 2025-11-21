'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Send } from 'lucide-react'
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

  return (
    // Masonry Grid (小红书风格双列布局)
    <div className="columns-2 gap-3 space-y-3">
      {posts.map((post) => {
        const identity = getAnonymousIdentity(post.user_id)
        const hugCount = post.hugs[0]?.count || 0
        const isJustHugged = huggingIds.has(post.id)
        const isCommentOpen = openCommentId === post.id

        return (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            // ✨ 样式升级：圆角变小(rounded-xl)，边距变小(p-3)，边框更细
            className="break-inside-avoid bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md transition-all mb-3"
          >
            {/* 图片 (如果有，放最上面，占满宽度) */}
            {post.image_url && (
              <div className="rounded-lg overflow-hidden mb-3">
                 <img src={post.image_url} className="w-full h-auto object-cover" />
              </div>
            )}

            {/* 头部：小头像 */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${identity.color}`}>
                  {identity.icon}
                </div>
                <p className="text-xs font-bold text-gray-600 truncate max-w-[60px]">{identity.name}</p>
              </div>
              <span className="text-[10px] bg-gray-50 px-1.5 py-0.5 rounded text-gray-400 uppercase">
                {post.mood}
              </span>
            </div>

            {/* 内容 */}
            <p className="text-gray-800 text-xs leading-relaxed font-medium mb-3 line-clamp-4">
              {post.content}
            </p>

            {/* 底部：极简互动栏 */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-50">
               <button onClick={() => toggleComments(post.id)} className="text-gray-400 hover:text-blue-500 transition-colors">
                 <MessageCircle size={14} />
               </button>
               <button 
                 onClick={() => handleHug(post.id)}
                 disabled={isJustHugged}
                 className={`flex items-center gap-1 transition-all ${isJustHugged ? 'text-pink-500' : 'text-gray-400 hover:text-pink-400'}`}
               >
                 <Heart size={14} fill={isJustHugged ? "currentColor" : "none"} />
                 <span className="text-[10px] font-bold">{hugCount}</span>
               </button>
            </div>

            {/* 评论区 (简化版) */}
            <AnimatePresence>
              {isCommentOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="bg-gray-50 rounded-lg p-2 mt-2 space-y-2">
                    {comments.map(c => (
                       <div key={c.id} className="text-[10px] text-gray-600 bg-white p-1.5 rounded border border-gray-100">{c.content}</div>
                    ))}
                    <div className="flex gap-1 mt-1">
                      <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="..." className="flex-1 bg-white border border-gray-200 rounded px-2 text-[10px] h-6" onKeyDown={e => e.key === 'Enter' && sendComment(post.id)} />
                      <button onClick={() => sendComment(post.id)} className="text-blue-500"><Send size={12}/></button>
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
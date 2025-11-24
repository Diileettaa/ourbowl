'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Calendar, Globe, Users, ChevronDown, Check, Plus, Map, Trash2, MoreHorizontal } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfile } from '@/context/ProfileContext'

export default function NavBar() {
  const pathname = usePathname()
  if (pathname === '/') return null 

  const { currentProfile, profiles, switchProfile, addProfile, deleteProfile } = useProfile()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  
  // 新增表单状态
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<'pet' | 'human'>('pet')

  const handleAdd = async () => {
    if (!newName) return
    await addProfile(newName, newType, newType === 'pet' ? '🐾' : '👶')
    setIsAdding(false)
    setNewName('')
  }

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Journey', href: '/journey', icon: Map },
    { name: 'Galaxy', href: '/exploration', icon: Globe },
    { name: 'Park', href: '/park', icon: Users },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 pointer-events-none flex justify-center">
      <div className="w-full max-w-5xl flex justify-between items-center pointer-events-auto">
        
        <Link href="/dashboard" className="text-2xl font-black text-gray-800 tracking-tighter">
          Ourbowl<span className="text-[#F5C066]">.</span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full shadow-sm border border-white/50">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive ? 'bg-[#111827] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                <item.icon size={16} /> {item.name}
              </Link>
            )
          })}
        </div>

        {/* Profile Switcher */}
        <div className="relative">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 bg-white p-1 pr-3 rounded-full shadow-sm border border-white hover:scale-105 transition-transform">
            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-lg">
              {currentProfile?.avatar_emoji || '😎'}
            </div>
            <ChevronDown size={16} className="text-gray-400" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden">
                
                {/* 标题行 + 加号 */}
                <div className="flex justify-between items-center px-3 py-2">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Switch Profile</span>
                   <button onClick={() => setIsAdding(true)} className="p-1 hover:bg-gray-100 rounded"><Plus size={14} className="text-gray-400"/></button>
                </div>

                {/* 列表 */}
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {profiles.map((p) => (
                    <div key={p.id} className="group flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => { switchProfile(p.id); setIsMenuOpen(false) }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">{p.avatar_emoji}</div>
                        <div>
                           <p className="font-bold text-sm text-gray-700">{p.name}</p>
                           <p className="text-[10px] text-gray-400 capitalize">{p.type}</p>
                        </div>
                      </div>
                      {currentProfile?.id === p.id && <Check size={14} className="text-green-500" />}
                      
                      {/* 删除按钮 (只有在Hover时显示，且不能删自己) */}
                      {currentProfile?.id !== p.id && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); if(confirm('Delete this profile?')) deleteProfile(p.id) }}
                           className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-50 rounded"
                         >
                           <Trash2 size={14}/>
                         </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* 新增面板 */}
                {isAdding && (
                   <div className="p-3 bg-gray-50 rounded-xl mt-2 animate-in fade-in">
                      <p className="text-xs font-bold mb-2">Add New Profile</p>
                      <div className="flex gap-2 mb-2">
                         <button onClick={() => setNewType('human')} className={`flex-1 py-1 text-xs rounded border ${newType==='human'?'bg-white border-gray-300 shadow-sm':'border-transparent text-gray-400'}`}>Human</button>
                         <button onClick={() => setNewType('pet')} className={`flex-1 py-1 text-xs rounded border ${newType==='pet'?'bg-white border-gray-300 shadow-sm':'border-transparent text-gray-400'}`}>Pet</button>
                      </div>
                      <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name..." className="w-full p-1.5 text-xs rounded border border-gray-200 mb-2" />
                      <div className="flex gap-2">
                         <button onClick={handleAdd} className="flex-1 bg-black text-white text-xs py-1.5 rounded">Add</button>
                         <button onClick={() => setIsAdding(false)} className="flex-1 text-gray-400 text-xs">Cancel</button>
                      </div>
                   </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  )
}
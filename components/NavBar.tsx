'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Calendar, Globe, Users, ChevronDown, Check, Plus, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NavBar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [currentProfile, setCurrentProfile] = useState('human') 

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Journey', href: '/journey', icon: Map },
    { name: 'Galaxy', href: '/exploration', icon: Globe },
    { name: 'Park', href: '/park', icon: Users },
  ]

  const profiles = [
    { id: 'human', name: 'Me', avatar: '😎', color: 'bg-yellow-100' },
    { id: 'pet', name: 'Mochi', avatar: '🥣', color: 'bg-green-100' },
  ]

  return (
    // ✨ 重点：这里没有任何 bg- 颜色，它是完全透明的，让页面的渐变色透上来
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none flex justify-center bg-gradient-to-b from-[#F9FAFB]/90 to-transparent backdrop-blur-sm">


      <div className="w-full max-w-5xl flex justify-between items-center pointer-events-auto">
        
        {/* 1. Logo (左侧) */}
        <Link href="/dashboard" className="text-2xl font-black text-gray-800 tracking-tighter hover:scale-105 transition-transform">
          Ourbowl<span className="text-[#F5C066]">.</span>
        </Link>

        {/* 2. 悬浮胶囊菜单 (中间) - 只有这个胶囊有背景色 */}
        <div className="hidden md:flex items-center gap-1 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-[#111827] text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={16} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* 3. 角色切换 (右侧) */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 bg-white p-1 pr-3 rounded-full shadow-sm border border-white hover:scale-105 transition-transform"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
              profiles.find(p => p.id === currentProfile)?.color
            }`}>
              {profiles.find(p => p.id === currentProfile)?.avatar}
            </div>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 overflow-hidden"
              >
                <div className="text-xs font-bold text-gray-400 px-3 py-2 uppercase">Switch Profile</div>
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => {
                      setCurrentProfile(profile.id)
                      setIsProfileOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl transition-colors ${
                      currentProfile === profile.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${profile.color}`}>
                        {profile.avatar}
                      </div>
                      <span className="font-bold text-gray-700">{profile.name}</span>
                    </div>
                    {currentProfile === profile.id && <Check size={16} className="text-green-500" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </nav>
  )
}
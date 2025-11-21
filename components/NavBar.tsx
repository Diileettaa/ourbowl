'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Home, Calendar, Globe, Users, ChevronDown, Check, Plus, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NavBar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [currentProfile, setCurrentProfile] = useState('human') // 'human' or 'pet'

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
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 pointer-events-none">
      <div className="max-w-5xl mx-auto flex justify-between items-center pointer-events-auto">
        
        {/* 1. Logo Area */}
        <Link href="/dashboard" className="text-2xl font-black text-gray-800 tracking-tighter hover:scale-105 transition-transform">
          Ourbowl<span className="text-[#F5C066]">.</span>
        </Link>

        {/* 2. Floating Menu (Glassmorphism) */}
        <div className="hidden md:flex items-center gap-2 bg-white/80 backdrop-blur-xl px-2 py-2 rounded-full shadow-clay-sm border border-white/50">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon size={16} />
                {item.name}
              </Link>
            )
          })}
        </div>

        {/* 3. Duolingo-style Profile Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 bg-white p-1 pr-3 rounded-full shadow-clay-sm border border-white hover:scale-105 transition-transform"
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
                
                <div className="h-px bg-gray-100 my-1"></div>
                <div className="px-2 py-1">
                   <button className="w-full text-left text-xs font-bold text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                     <Plus size={14} /> Add Profile
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
      
      {/* Mobile Bottom Nav (Only shows on small screens) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl shadow-clay p-4 flex justify-between items-center border border-white/50">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`p-3 rounded-xl transition-all ${
                  isActive ? 'bg-gray-900 text-white' : 'text-gray-400'
                }`}
              >
                <item.icon size={24} />
              </Link>
            )
          })}
      </div>
    </nav>
  )
}

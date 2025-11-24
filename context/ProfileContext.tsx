'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'

type Profile = {
  id: string
  name: string
  type: 'human' | 'pet'
  avatar_emoji: string
}

type ProfileContextType = {
  currentProfile: Profile | null
  profiles: Profile[]
  switchProfile: (profileId: string) => void
  addProfile: (name: string, type: 'human' | 'pet', emoji: string) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
  refreshProfiles: () => Promise<void>
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null)

  // 初始化：加载所有档案
  const refreshProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('sub_profiles').select('*').eq('user_id', user.id)
    
    if (data && data.length > 0) {
      setProfiles(data)
      // 如果当前没有选中，默认选中第一个（通常是主人自己）
      if (!currentProfile) {
        // 优先找 type='human' 的
        const human = data.find(p => p.type === 'human')
        setCurrentProfile(human || data[0])
      }
    } else {
      // 如果是新用户，自动创建一个 "Me" 档案
      const newProfile = { user_id: user.id, name: 'Me', type: 'human', avatar_emoji: '😎' }
      const { data: created } = await supabase.from('sub_profiles').insert(newProfile).select().single()
      if (created) {
        setProfiles([created])
        setCurrentProfile(created)
      }
    }
  }

  useEffect(() => { refreshProfiles() }, [])

  const switchProfile = (id: string) => {
    const target = profiles.find(p => p.id === id)
    if (target) setCurrentProfile(target)
  }

  const addProfile = async (name: string, type: 'human' | 'pet', emoji: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('sub_profiles').insert({ user_id: user.id, name, type, avatar_emoji: emoji })
    await refreshProfiles()
  }

  const deleteProfile = async (id: string) => {
    if (profiles.length <= 1) return alert("You must have at least one profile!")
    await supabase.from('sub_profiles').delete().eq('id', id)
    await refreshProfiles()
    // 如果删的是当前选中的，自动切到第一个
    if (currentProfile?.id === id) {
      setCurrentProfile(profiles[0])
    }
  }

  return (
    <ProfileContext.Provider value={{ currentProfile, profiles, switchProfile, addProfile, deleteProfile, refreshProfiles }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useProfile = () => {
  const context = useContext(ProfileContext)
  if (context === undefined) throw new Error('useProfile must be used within a ProfileProvider')
  return context
}
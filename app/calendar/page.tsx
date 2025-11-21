'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, parseISO } from 'date-fns'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date()) // 当前月份
  const [entries, setEntries] = useState<any[]>([])
  const [keyword, setKeyword] = useState('') // 搜索关键词
  
  // 1. 获取数据 (一次性获取所有，方便搜索)
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('entries').select('*')
      setEntries(data || [])
    }
    fetchData()
  }, [])

  // 2. 日历算法
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // 补齐前面的空格 (让1号对齐星期几)
  const startDayOfWeek = monthStart.getDay() // 0是周日
  const emptyDays = Array(startDayOfWeek).fill(null)

  // 3. 核心逻辑：判断某一天是否匹配搜索
  const checkDateStatus = (day: Date) => {
    // 找到这一天的所有日记
    const daysEntries = entries.filter(e => isSameDay(parseISO(e.created_at), day))
    
    if (daysEntries.length === 0) return 'empty' // 没日记

    // 如果有搜索词
    if (keyword.trim()) {
      // 检查这一天的日记里，有没有包含关键词的
      const hasKeyword = daysEntries.some(e => 
        e.content?.toLowerCase().includes(keyword.toLowerCase()) ||
        e.mood?.toLowerCase().includes(keyword.toLowerCase()) ||
        e.meal_type?.toLowerCase().includes(keyword.toLowerCase())
      )
      if (hasKeyword) return 'match' // ✨ 命中！(亮灯)
      return 'dim' // 有日记但没命中 (变暗)
    }

    return 'has-entry' // 正常有日记
  }

  // 切换月份
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + offset)
    setCurrentDate(newDate)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 flex flex-col items-center">
      
      <div className="max-w-md w-full space-y-6">
        
        {/* 🔍 搜索栏 (Google 风格悬浮条) */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 group-focus-within:text-blue-500 transition-colors"/>
          </div>
          <input 
            type="text" 
            placeholder="Search memories (e.g., Gym, Pizza, Happy)..." 
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>

        {/* 📅 日历卡片 (Google 风格：紧凑、干净) */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          
          {/* 头部：月份切换 */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 pl-2">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={20}/></button>
              <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><ChevronRight size={20}/></button>
            </div>
          </div>

          {/* 星期头 */}
          <div className="grid grid-cols-7 mb-2">
            {['S','M','T','W','T','F','S'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* 日期格子 */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {/* 空白占位 */}
            {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}

            {/* 真实日期 */}
            {days.map((day) => {
              const status = checkDateStatus(day)
              const isToday = isSameDay(day, new Date())
              
              return (
                <div key={day.toString()} className="flex flex-col items-center justify-center aspect-square relative">
                  <div className={`
                    w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-300
                    ${isToday && status === 'empty' ? 'bg-blue-600 text-white' : ''} 
                    ${status === 'empty' && !isToday ? 'text-gray-700 hover:bg-gray-100' : ''}
                    
                    ${status === 'has-entry' ? 'bg-gray-100 text-gray-900 font-bold' : ''} 
                    
                    /* ✨ 命中高亮状态：橙色呼吸灯 */
                    ${status === 'match' ? 'bg-orange-400 text-white shadow-md scale-110 ring-2 ring-orange-100' : ''}
                    
                    /* 没命中变暗状态 */
                    ${status === 'dim' ? 'text-gray-300' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* 命中的小红点标记 */}
                  {status === 'match' && (
                    <div className="w-1 h-1 bg-orange-400 rounded-full mt-1"></div>
                  )}
                  {/* 普通有日记的标记 */}
                  {status === 'has-entry' && !keyword && (
                    <div className="w-1 h-1 bg-gray-300 rounded-full mt-1"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 👇 搜索结果列表 (只有搜索时显示) */}
        {keyword && (
          <div className="animate-in slide-in-from-bottom-4 fade-in">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">
              Found Records
            </h3>
            <div className="space-y-2">
              {entries.filter(e => e.content?.toLowerCase().includes(keyword.toLowerCase())).map(entry => (
                <div key={entry.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-3 items-center">
                   <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-lg shrink-0">
                     {/* 简单的日期数字 */}
                     <span className="text-xs font-bold text-orange-600">
                       {new Date(entry.created_at).getDate()}
                     </span>
                   </div>
                   <div className="min-w-0">
                     <p className="text-sm text-gray-800 font-medium truncate">{entry.content}</p>
                     <p className="text-xs text-gray-400">
                       {new Date(entry.created_at).toLocaleDateString()} • {entry.mood}
                     </p>
                   </div>
                </div>
              ))}
              {entries.filter(e => e.content?.toLowerCase().includes(keyword.toLowerCase())).length === 0 && (
                <div className="text-center text-gray-400 text-sm py-4">No matches found for "{keyword}"</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
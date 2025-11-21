'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, 
  getDay, addMonths, subMonths, differenceInDays 
} from 'date-fns'
import { Search, ChevronLeft, ChevronRight, Filter, X, Lock, TrendingUp } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts'

// 情绪配置 (保持一致)
const MOODS = [
  { name: 'Joy', emoji: '🥰', color: '#FBBF24' }, // Amber
  { name: 'Calm', emoji: '🌿', color: '#34D399' }, // Emerald
  { name: 'Neutral', emoji: '😶', color: '#9CA3AF' }, // Gray
  { name: 'Tired', emoji: '😴', color: '#818CF8' }, // Indigo
  { name: 'Stressed', emoji: '🤯', color: '#F87171' }, // Red
  { name: 'Sad', emoji: '😭', color: '#60A5FA' }, // Blue
  { name: 'Angry', emoji: '🤬', color: '#EF4444' }, // Red
  { name: 'Excited', emoji: '🎉', color: '#F472B6' }, // Pink
  { name: 'Sick', emoji: '🤢', color: '#10B981' }, // Green
  { name: 'Proud', emoji: '😎', color: '#FB923C' }, // Orange
  { name: 'Love', emoji: '❤️', color: '#EC4899' }, // Pink
  { name: 'Other', emoji: '💭', color: '#D1D5DB' }
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<any[]>([])
  const [searchText, setSearchText] = useState('')
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  // 计算用户使用了多少天
  const [daysActive, setDaysActive] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('entries').select('*').order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setEntries(data)
        // 计算活跃天数：今天 - 第一条日记的时间
        const firstDate = parseISO(data[0].created_at)
        const diff = differenceInDays(new Date(), firstDate)
        setDaysActive(diff)
      }
    }
    fetchData()
  }, [])

  // --- 日历基础数据 ---
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = monthStart.getDay()
  const emptyDays = Array(startDayOfWeek).fill(null)

  // --- 筛选逻辑 ---
  const checkDateStatus = (day: Date) => {
    const daysEntries = entries.filter(e => isSameDay(parseISO(e.created_at), day))
    if (daysEntries.length === 0) return 'empty'
    if (filterMood) return daysEntries.some(e => e.mood === filterMood) ? 'match' : 'dim'
    if (searchText.trim()) {
      const lower = searchText.toLowerCase()
      return daysEntries.some(e => 
        e.content?.toLowerCase().includes(lower) || e.meal_type?.toLowerCase().includes(lower)
      ) ? 'match' : 'dim'
    }
    return 'has-entry'
  }

  // --- 📊 统计逻辑 (核心升级) ---

  // 1. 周统计数据 (Stacked Bar Data)
  const weeklyStats = useMemo(() => {
    // 获取当前选中日期的那一周
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    
    // 初始化 7 天的数据结构
    const data = Array(7).fill(0).map((_, i) => {
       const dayData: any = { name: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i] }
       // 初始化所有情绪为 0 (为了堆叠图不出错)
       MOODS.forEach(m => dayData[m.name] = 0)
       return dayData
    })

    // 填充数据
    entries.filter(e => {
      const d = parseISO(e.created_at)
      return d >= weekStart && d <= weekEnd
    }).forEach(e => {
      const dayIndex = getDay(parseISO(e.created_at))
      const moodName = MOODS.find(m => m.name === e.mood)?.name || 'Other'
      data[dayIndex][moodName] += 1
    })
    
    return data
  }, [entries, currentDate])

  // 2. 月统计数据 (Pie Chart)
  const monthlyEntries = entries.filter(e => isSameMonth(parseISO(e.created_at), currentDate))
  
  const monthlyStats = useMemo(() => {
    const stats: Record<string, number> = {}
    monthlyEntries.forEach(e => {
      const mood = MOODS.find(m => m.name === e.mood)?.name || 'Other'
      stats[mood] = (stats[mood] || 0) + 1
    })
    // 转数组并排序
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value, color: MOODS.find(m => m.name === name)?.color }))
      .sort((a, b) => b.value - a.value)
  }, [monthlyEntries])


  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 flex flex-col items-center text-[#1F2937] pb-32">
      <div className="max-w-lg w-full space-y-8">
        
        {/* 1. 搜索栏 (保持不变) */}
        <div className="relative z-20">
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-2 transition-shadow focus-within:shadow-md focus-within:border-blue-200">
            <Search size={20} className="text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder={filterMood ? `Filtered: ${filterMood}` : "Search memories..."}
              value={searchText}
              onChange={(e) => { setSearchText(e.target.value); setFilterMood(null) }}
              className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`p-2 rounded-xl transition-colors flex items-center gap-2 ${filterMood ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {filterMood ? <><span className="text-lg">{MOODS.find(m => m.name === filterMood)?.emoji}</span><X size={14} onClick={(e) => { e.stopPropagation(); setFilterMood(null) }} /></> : <Filter size={18} />}
            </button>
          </div>
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in z-50">
               <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Filter by Mood</h4>
               <div className="flex flex-wrap gap-2">
                 {MOODS.map(m => (
                   <button key={m.name} onClick={() => { setFilterMood(m.name); setSearchText(''); setShowFilterMenu(false) }} className="px-3 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-100 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors">
                     <span>{m.emoji}</span> {m.name}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>

        {/* 2. 日历 (保持不变) */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-800 pl-1 tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200">Today</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2">
            {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
            {days.map((day) => {
              const status = checkDateStatus(day)
              const isToday = isSameDay(day, new Date())
              return (
                <div key={day.toString()} className="flex flex-col items-center justify-center aspect-square relative">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all ${isToday && status === 'empty' ? 'bg-black text-white' : ''} ${status === 'empty' && !isToday ? 'text-gray-400 hover:bg-gray-50' : ''} ${status === 'has-entry' ? 'bg-gray-100 text-gray-900 font-bold' : ''} ${status === 'match' ? 'bg-orange-400 text-white shadow-md scale-110 ring-2 ring-orange-100' : ''} ${status === 'dim' ? 'text-gray-200' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  {status === 'has-entry' && !filterMood && !searchText && <div className="w-1 h-1 bg-gray-300 rounded-full mt-1"></div>}
                  {status === 'match' && <div className="w-1 h-1 bg-orange-200 rounded-full mt-1"></div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* --- 3. 每周洞察 (Weekly Insights - 永远显示) --- */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm">
           <div className="flex items-center gap-2 mb-6">
              <TrendingUp size={18} className="text-orange-500" />
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">This Week's Emotions</h3>
           </div>
           
           <div className="h-48 w-full">
              {/* 堆叠柱状图：所有情绪都显示在柱子上 */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyStats} barSize={12}>
                  <XAxis dataKey="name" tick={{fontSize: 10, fill:'#9CA3AF'}} axisLine={false} tickLine={false} dy={10} />
                  <RechartsTooltip 
                     cursor={{fill: '#F3F4F6'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  />
                  {/* 循环渲染每种情绪的 Bar，stackId='a' 表示它们会堆在一起 */}
                  {MOODS.map(mood => (
                    <Bar 
                      key={mood.name} 
                      dataKey={mood.name} 
                      stackId="a" 
                      fill={mood.color} 
                      radius={[2, 2, 2, 2]} // 小圆角
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
           </div>
           <p className="text-[10px] text-gray-400 text-center mt-4">
             Stacked view of all your moods this week
           </p>
        </div>


        {/* --- 4. 月度深度洞察 (Monthly Insights - 带解锁逻辑) --- */}
        <div className="relative">
          {/* 标题 */}
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Monthly Report</h3>
             {daysActive < 15 && <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">{15 - daysActive} days left</span>}
          </div>

          {/* 内容容器 */}
          <div className={`bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm transition-all ${daysActive < 15 ? 'blur-sm opacity-60 select-none pointer-events-none' : ''}`}>
             
             <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* 左侧：甜甜圈图 */}
                <div className="w-40 h-40 relative shrink-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthlyStats}
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {monthlyStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#ddd'} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   {/* 中间显示的数字 */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-gray-800">{monthlyEntries.length}</span>
                      <span className="text-[8px] text-gray-400 uppercase">Entries</span>
                   </div>
                </div>

                {/* 右侧：详细列表 (Mood Summary) */}
                <div className="flex-1 w-full space-y-3">
                   {monthlyStats.length > 0 ? monthlyStats.slice(0, 5).map(stat => (
                      <div key={stat.name} className="flex items-center justify-between text-xs">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: stat.color }}></div>
                            <span className="font-bold text-gray-600">{stat.name}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-400">{stat.value}</span>
                            <span className="text-[10px] text-gray-300 w-8 text-right">
                               {Math.round((stat.value / monthlyEntries.length) * 100)}%
                            </span>
                         </div>
                      </div>
                   )) : (
                     <div className="text-center text-xs text-gray-300 py-4">No data this month</div>
                   )}
                </div>
             </div>

          </div>

          {/* 🔒 锁定遮罩层 (如果天数不够，显示这个) */}
          {daysActive < 15 && (
             <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border border-white text-center max-w-xs">
                   <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Lock size={24} />
                   </div>
                   <h4 className="font-bold text-gray-800 mb-1">Unlock Monthly Insights</h4>
                   <p className="text-xs text-gray-500 leading-relaxed">
                      Keep tracking for <strong>{15 - daysActive} more days</strong> to unlock deep analysis of your emotional trends.
                   </p>
                </div>
             </div>
          )}

        </div>

      </div>
    </div>
  )
}
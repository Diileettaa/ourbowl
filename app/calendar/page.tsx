'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, 
  getDay, addMonths, subMonths, differenceInDays, subDays 
} from 'date-fns'
import { Search, ChevronLeft, ChevronRight, Filter, X, Lock, TrendingUp, BarChart2 } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, YAxis, CartesianGrid
} from 'recharts'

const MOODS = [
  { name: 'Joy', emoji: '🥰', color: '#FBBF24', score: 5 }, 
  { name: 'Calm', emoji: '🌿', color: '#34D399', score: 4 },
  { name: 'Neutral', emoji: '😶', color: '#9CA3AF', score: 3 },
  { name: 'Tired', emoji: '😴', color: '#818CF8', score: 2 },
  { name: 'Stressed', emoji: '🤯', color: '#F87171', score: 2 },
  { name: 'Sad', emoji: '💧', color: '#60A5FA', score: 1 },
  { name: 'Angry', emoji: '🤬', color: '#EF4444', score: 1 },
  { name: 'Excited', emoji: '🎉', color: '#F472B6', score: 5 },
  { name: 'Sick', emoji: '🤢', color: '#10B981', score: 1 },
  { name: 'Proud', emoji: '😎', color: '#FB923C', score: 5 },
  { name: 'Love', emoji: '❤️', color: '#EC4899', score: 5 },
  { name: 'Other', emoji: '💭', color: '#D1D5DB', score: 3 }
]

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<any[]>([])
  const [searchText, setSearchText] = useState('')
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [daysActive, setDaysActive] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('entries').select('*').order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setEntries(data)
        const firstDate = parseISO(data[0].created_at)
        const diff = differenceInDays(new Date(), firstDate)
        setDaysActive(diff)
      }
    }
    fetchData()
  }, [])

  // --- 日历数据 ---
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
      return daysEntries.some(e => e.content?.toLowerCase().includes(lower) || e.meal_type?.toLowerCase().includes(lower)) ? 'match' : 'dim'
    }
    return 'has-entry'
  }

  // --- 📊 统计逻辑 ---

  // 1. 本周情绪构成 (堆叠柱状图)
  const weeklyStats = useMemo(() => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    const data = Array(7).fill(0).map((_, i) => {
       const dayData: any = { name: ['S','M','T','W','T','F','S'][i] }
       MOODS.forEach(m => dayData[m.name] = 0)
       return dayData
    })
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

  // 2. 本周情绪波动 (折线图)
  const weeklyTrend = useMemo(() => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    const data = Array(7).fill(0).map((_, i) => ({ name: ['S','M','T','W','T','F','S'][i], score: 0, count: 0 }))
    
    entries.filter(e => {
      const d = parseISO(e.created_at)
      return d >= weekStart && d <= weekEnd
    }).forEach(e => {
      const dayIndex = getDay(parseISO(e.created_at))
      const score = MOODS.find(m => m.name === e.mood)?.score || 3
      data[dayIndex].score += score
      data[dayIndex].count += 1
    })

    return data.map(d => ({ 
      name: d.name, 
      // 计算平均分，保留1位小数
      avgScore: d.count > 0 ? parseFloat((d.score / d.count).toFixed(1)) : null 
    }))
  }, [entries, currentDate])

  // 3. 月度统计 (只显示上个月的，且需要数据量达标)
  // 逻辑：虽然用户看的是"当前日历月"，但统计面板展示的是"上个月的总结报告"
  const lastMonthDate = subMonths(currentDate, 1)
  const lastMonthEntries = entries.filter(e => isSameMonth(parseISO(e.created_at), lastMonthDate))
  
  // 检查上个月的数据量是否足够 (>=15条)
  // 注意：这里简单用条数代替天数，你可以改成天数
  const isMonthUnlocked = lastMonthEntries.length >= 5 // 为了测试方便，我先设成 5，你可以改成 15

  const monthlyStats = useMemo(() => {
    const stats: Record<string, number> = {}
    lastMonthEntries.forEach(e => {
      const mood = MOODS.find(m => m.name === e.mood)?.name || 'Other'
      stats[mood] = (stats[mood] || 0) + 1
    })
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value, color: MOODS.find(m => m.name === name)?.color }))
      .sort((a, b) => b.value - a.value)
  }, [lastMonthEntries])

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 flex flex-col items-center text-[#1F2937] pb-32">
      <div className="max-w-lg w-full space-y-8">
        
        {/* 搜索栏 (不变) */}
        <div className="relative z-20">
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-2 transition-shadow focus-within:shadow-md focus-within:border-blue-200">
            <Search size={20} className="text-gray-400 ml-2" />
            <input type="text" placeholder={filterMood ? `Filtered: ${filterMood}` : "Search..."} value={searchText} onChange={(e) => { setSearchText(e.target.value); setFilterMood(null) }} className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"/>
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`p-2 rounded-xl transition-colors flex items-center gap-2 ${filterMood ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {filterMood ? <><span className="text-lg">{MOODS.find(m => m.name === filterMood)?.emoji}</span><X size={14} onClick={(e) => { e.stopPropagation(); setFilterMood(null) }} /></> : <Filter size={18} />}
            </button>
          </div>
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in z-50 flex flex-wrap gap-2">
               {MOODS.map(m => (
                 <button key={m.name} onClick={() => { setFilterMood(m.name); setSearchText(''); setShowFilterMenu(false) }} className="px-3 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-100 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors">
                   <span>{m.emoji}</span> {m.name}
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* 日历 (不变) */}
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

        {/* --- 3. 每周洞察 (Weekly Insights) --- */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm space-y-8">
           
           {/* 3.1 情绪堆叠柱状图 */}
           <div>
             <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={18} className="text-orange-500" />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Mood Stack</h3>
             </div>
             <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyStats} barSize={12}>
                    <XAxis dataKey="name" tick={{fontSize: 10, fill:'#9CA3AF'}} axisLine={false} tickLine={false} dy={10} />
                    <RechartsTooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                    {MOODS.map(mood => (
                      <Bar key={mood.name} dataKey={mood.name} stackId="a" fill={mood.color} radius={[0,0,0,0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
             </div>
           </div>

           {/* 3.2 情绪趋势折线图 */}
           <div>
             <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-blue-500" />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Emotional Flow</h3>
             </div>
             <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyTrend}>
                    <XAxis dataKey="name" tick={{fontSize: 10, fill:'#9CA3AF'}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis hide domain={[1, 5]} /> {/* 分数范围 1-5 */}
                    <RechartsTooltip cursor={{stroke: '#ddd'}} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="avgScore" stroke="#3B82F6" strokeWidth={3} dot={{r:3, fill:'white', stroke:'#3B82F6', strokeWidth:2}} activeDot={{r:5}} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
             </div>
           </div>

        </div>

        {/* --- 4. 月度报告 (Monthly Report - 上个月) --- */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4 px-2">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
               Report: {format(lastMonthDate, 'MMMM')}
             </h3>
             {/* 如果还没解锁 */}
             {!isMonthUnlocked && <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">Locked</span>}
          </div>

          <div className={`bg-white p-6 rounded-[32px] border border-gray-200 shadow-sm transition-all ${!isMonthUnlocked ? 'blur-sm opacity-60 select-none pointer-events-none' : ''}`}>
             <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* 左侧：Donut Chart */}
                <div className="w-32 h-32 relative shrink-0">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={monthlyStats} innerRadius={30} outerRadius={45} paddingAngle={4} dataKey="value">
                          {monthlyStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#ddd'} stroke="none" />
                          ))}
                        </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-gray-800">{lastMonthEntries.length}</span>
                   </div>
                </div>
                {/* 右侧：详细列表 */}
                <div className="flex-1 w-full space-y-2">
                   {monthlyStats.length > 0 ? monthlyStats.slice(0, 4).map(stat => (
                      <div key={stat.name} className="flex items-center justify-between text-xs">
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: stat.color }}></div>
                            <span className="font-bold text-gray-600">{stat.name}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-400">{stat.value}</span>
                            <span className="text-[10px] text-gray-300 w-8 text-right">{Math.round((stat.value / lastMonthEntries.length) * 100)}%</span>
                         </div>
                      </div>
                   )) : <div className="text-center text-xs text-gray-300">No data</div>}
                </div>
             </div>
          </div>

          {/* 锁定遮罩 */}
          {!isMonthUnlocked && (
             <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white text-center max-w-xs">
                   <Lock size={20} className="mx-auto mb-2 text-gray-400" />
                   <p className="text-xs text-gray-500">Keep tracking to unlock next month!</p>
                </div>
             </div>
          )}
        </div>

      </div>
    </div>
  )
}
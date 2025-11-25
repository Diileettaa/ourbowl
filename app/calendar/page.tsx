'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, 
  getDay, addMonths, subMonths, differenceInDays, startOfYear, endOfYear, eachMonthOfInterval 
} from 'date-fns'
import { Search, ChevronLeft, ChevronRight, Filter, X, Lock, TrendingUp, BarChart2, PieChart as PieIcon, Calendar as CalIcon } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, YAxis, CartesianGrid
} from 'recharts'

// --- 1. 情绪配置 (带分数和颜色) ---
const MOODS = [
  { name: 'Joy', emoji: '🥰', color: '#FBBF24', score: 5 },       // Amber-400
  { name: 'Calm', emoji: '🌿', color: '#34D399', score: 4 },      // Emerald-400
  { name: 'Neutral', emoji: '😶', color: '#9CA3AF', score: 3 },   // Gray-400
  { name: 'Tired', emoji: '😴', color: '#818CF8', score: 2 },     // Indigo-400
  { name: 'Stressed', emoji: '🤯', color: '#F87171', score: 1 },  // Red-400
  { name: 'Sad', emoji: '💧', color: '#60A5FA', score: 1 },       // Blue-400
  { name: 'Angry', emoji: '🤬', color: '#EF4444', score: 1 },     // Red-500
  { name: 'Excited', emoji: '🎉', color: '#F472B6', score: 5 },   // Pink-400
  { name: 'Sick', emoji: '🤢', color: '#10B981', score: 1 },      // Green-500
  { name: 'Proud', emoji: '😎', color: '#FB923C', score: 5 },     // Orange-400
  { name: 'Love', emoji: '❤️', color: '#EC4899', score: 5 },      // Pink-500
  { name: 'Other', emoji: '💭', color: '#D1D5DB', score: 3 }      // Gray-300
]

export default function CalendarPage() {
  // --- 状态管理 ---
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<any[]>([])
  
  // 搜索 & 筛选
  const [searchText, setSearchText] = useState('')
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  // 统计视图切换
  const [statsView, setStatsView] = useState<'week' | 'month' | 'year'>('week')
  
  // 用户活跃天数 (用于解锁功能)
  const [daysActive, setDaysActive] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
      
      if (data && data.length > 0) {
        setEntries(data)
        const firstDate = parseISO(data[0].created_at)
        const diff = differenceInDays(new Date(), firstDate)
        setDaysActive(diff)
      }
    }
    fetchData()
  }, [])

  // --- A. 日历核心逻辑 (保留) ---
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDayOfWeek = monthStart.getDay()
  const emptyDays = Array(startDayOfWeek).fill(null)

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

  // --- B. 统计数据计算 (新功能) ---

  // 1. 周数据：堆叠柱状图 (Mood Stack)
  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    
    // 初始化7天结构
    const data = Array(7).fill(0).map((_, i) => {
       const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]
       const dayObj: any = { name: dayName, totalScore: 0, count: 0 }
       MOODS.forEach(m => dayObj[m.name] = 0) // 初始化每个情绪数量为0
       return dayObj
    })

    entries.filter(e => {
      const d = parseISO(e.created_at)
      return d >= weekStart && d <= weekEnd
    }).forEach(e => {
      const dayIndex = getDay(parseISO(e.created_at))
      const moodConfig = MOODS.find(m => m.name === e.mood)
      const moodName = moodConfig?.name || 'Other'
      
      data[dayIndex][moodName] += 1 // 堆叠图计数
      data[dayIndex].totalScore += (moodConfig?.score || 3) // 折线图分数
      data[dayIndex].count += 1
    })

    // 计算平均分
    return data.map(d => ({
      ...d,
      avgScore: d.count > 0 ? parseFloat((d.totalScore / d.count).toFixed(1)) : null
    }))
  }, [entries, currentDate])

  // 2. 月数据：饼图 (Mood Mix) - 只看当前选择的月份
  const monthlyEntries = entries.filter(e => isSameMonth(parseISO(e.created_at), currentDate))
  const monthlyStats = useMemo(() => {
    const stats: Record<string, number> = {}
    monthlyEntries.forEach(e => {
      const mood = MOODS.find(m => m.name === e.mood)?.name || 'Other'
      stats[mood] = (stats[mood] || 0) + 1
    })
    return Object.entries(stats)
      .map(([name, value]) => ({ name, value, color: MOODS.find(m => m.name === name)?.color }))
      .sort((a, b) => b.value - a.value)
  }, [monthlyEntries])

  // 3. 年数据：每月开心指数
  const yearlyData = useMemo(() => {
    const yearStart = startOfYear(currentDate)
    const yearEnd = endOfYear(currentDate)
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })
    
    return months.map(m => {
       const monthEntries = entries.filter(e => isSameMonth(parseISO(e.created_at), m))
       const happyCount = monthEntries.filter(e => ['Joy','Excited','Proud','Love'].includes(e.mood)).length
       return {
         name: format(m, 'MMM'),
         happyCount: happyCount,
         total: monthEntries.length
       }
    })
  }, [entries, currentDate])

  // 解锁状态
  const isMonthUnlocked = daysActive >= 7 // 体验版：7天解锁月报
  const isYearUnlocked = daysActive >= 30 // 体验版：30天解锁年报

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 flex flex-col items-center text-[#1F2937] pb-32">
      <div className="max-w-lg w-full space-y-8">
        
        {/* --- 1. 搜索栏 (保留) --- */}
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
            <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in z-50 flex flex-wrap gap-2">
               {MOODS.map(m => (
                 <button key={m.name} onClick={() => { setFilterMood(m.name); setSearchText(''); setShowFilterMenu(false) }} className="px-3 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-100 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors">
                   <span>{m.emoji}</span> {m.name}
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* --- 2. 日历 (保留) --- */}
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

        {/* --- 3. 统计分析中心 (Analytics Hub) --- */}
        <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-6">
          
          {/* 3.1 顶部切换条 (Tabs) */}
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
               <TrendingUp size={16} className="text-blue-500"/> Insights
             </h3>
             <div className="flex bg-gray-100 p-1 rounded-xl">
                {['week', 'month', 'year'].map((v) => {
                  // 检查是否锁定
                  const isLocked = (v === 'month' && !isMonthUnlocked) || (v === 'year' && !isYearUnlocked)
                  return (
                    <button
                      key={v}
                      onClick={() => !isLocked && setStatsView(v as any)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize transition-all flex items-center gap-1 ${
                        statsView === v 
                        ? 'bg-white text-black shadow-sm' 
                        : isLocked ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {isLocked && <Lock size={8} />} {v}
                    </button>
                  )
                })}
             </div>
          </div>

          {/* 3.2 图表内容区 (根据 Tab 切换) */}
          <div className="h-48 w-full relative">
            
            {/* --- Week View: 堆叠柱状图 + 折线图 --- */}
            {statsView === 'week' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barSize={20}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                   <XAxis dataKey="name" tick={{fontSize: 10, fill:'#9CA3AF'}} axisLine={false} tickLine={false} dy={10} />
                   <RechartsTooltip 
                     cursor={{fill: '#F9FAFB'}}
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                   />
                   {/* 堆叠柱子 (数量) */}
                   {MOODS.map(m => (
                     <Bar key={m.name} dataKey={m.name} stackId="a" fill={m.color} radius={[0,0,0,0]} />
                   ))}
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* --- Month View: 甜甜圈图 + 列表 --- */}
            {statsView === 'month' && (
              <div className="flex items-center h-full gap-6">
                {/* Donut Chart */}
                <div className="w-1/2 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={monthlyStats} innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                        {monthlyStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || '#ddd'} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-bold text-gray-800">{monthlyEntries.length}</span>
                     <span className="text-[8px] text-gray-400 uppercase">Entries</span>
                  </div>
                </div>
                {/* Legend List */}
                <div className="w-1/2 h-full overflow-y-auto pr-2 space-y-2">
                   {monthlyStats.map(stat => (
                     <div key={stat.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ background: stat.color }}></div>
                           <span className="font-bold text-gray-600">{stat.name}</span>
                        </div>
                        <span className="font-mono text-gray-400">{stat.value}</span>
                     </div>
                   ))}
                   {monthlyStats.length === 0 && <p className="text-xs text-gray-300">No data yet.</p>}
                </div>
              </div>
            )}

            {/* --- Year View: 年度开心柱状图 --- */}
            {statsView === 'year' && (
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={yearlyData} barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{fontSize: 10, fill:'#9CA3AF'}} axisLine={false} tickLine={false} dy={10} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                    <Bar dataKey="happyCount" fill="#FBBF24" radius={[4, 4, 4, 4]} name="Happy Days" />
                 </BarChart>
              </ResponsiveContainer>
            )}

          </div>
          
          {/* 底部说明 */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
             <p className="text-[10px] text-gray-400">
               {statsView === 'week' && "Showing mood distribution for this week"}
               {statsView === 'month' && "Monthly mood composition analysis"}
               {statsView === 'year' && "Your happiest months of the year"}
             </p>
          </div>

        </div>

      </div>
    </div>
  )
}
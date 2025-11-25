'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/utils/supabase/client'
import { 
  startOfMonth, endOfMonth, eachDayOfInterval, format, 
  isSameMonth, isSameDay, parseISO, startOfWeek, endOfWeek, 
  getDay, addMonths, subMonths, differenceInDays, startOfYear, endOfYear, eachMonthOfInterval 
} from 'date-fns'
import { Search, ChevronLeft, ChevronRight, Filter, X, Lock, TrendingUp, BarChart2, AlertCircle } from 'lucide-react'
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts'

// --- 配置 ---
const MOODS = [
  { name: 'Joy', emoji: '🥰', color: '#FBBF24', score: 5 },       
  { name: 'Excited', emoji: '🎉', color: '#F472B6', score: 5 },   
  { name: 'Proud', emoji: '😎', color: '#FB923C', score: 5 },     
  { name: 'Love', emoji: '❤️', color: '#EC4899', score: 5 },      
  { name: 'Calm', emoji: '🌿', color: '#34D399', score: 4 },      
  { name: 'Neutral', emoji: '😶', color: '#9CA3AF', score: 3 },   
  { name: 'Tired', emoji: '😴', color: '#818CF8', score: 2 },     
  { name: 'Stressed', emoji: '🤯', color: '#F87171', score: 2 },  
  { name: 'Sad', emoji: '💧', color: '#60A5FA', score: 1 },       
  { name: 'Angry', emoji: '🤬', color: '#EF4444', score: 1 },     
  { name: 'Sick', emoji: '🤢', color: '#10B981', score: 1 },      
  { name: 'Other', emoji: '💭', color: '#D1D5DB', score: 3 }      
]

// --- 自定义 Tooltip 组件 (美化版) ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // 只显示数量 > 0 的情绪
    const activeMoods = payload.filter((p: any) => p.value > 0).reverse()
    
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-xl border border-gray-100 text-xs min-w-[120px]">
        <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">{label}</p>
        <div className="space-y-1">
          {activeMoods.map((p: any) => (
            <div key={p.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: p.fill }}></div>
                <span className="text-gray-600">{p.name}</span>
              </span>
              <span className="font-bold text-gray-800">{p.value}</span>
            </div>
          ))}
          {activeMoods.length === 0 && <span className="text-gray-400">No records</span>}
        </div>
      </div>
    )
  }
  return null
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<any[]>([])
  const [searchText, setSearchText] = useState('')
  const [filterMood, setFilterMood] = useState<string | null>(null)
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const [statsView, setStatsView] = useState<'week' | 'month' | 'year'>('week')
  const [daysActive, setDaysActive] = useState(0)

  // 弹窗提示状态
  const [lockMessage, setLockMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('entries').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
      if (data && data.length > 0) {
        setEntries(data)
        const firstDate = parseISO(data[0].created_at)
        const diff = differenceInDays(new Date(), firstDate)
        setDaysActive(diff)
      }
    }
    fetchData()
  }, [])

  // --- 解锁检查逻辑 ---
  const handleViewChange = (view: 'week' | 'month' | 'year') => {
    if (view === 'month' && daysActive < 15) {
      setLockMessage(`Need 15 days of data to unlock Monthly view. (Current: ${daysActive} days)`)
      setTimeout(() => setLockMessage(null), 3000) // 3秒后自动消失
      return
    }
    if (view === 'year' && daysActive < 60) {
      setLockMessage(`Need 60 days of data to unlock Yearly view. (Current: ${daysActive} days)`)
      setTimeout(() => setLockMessage(null), 3000)
      return
    }
    setStatsView(view)
  }

  // --- 数据计算 ---
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
      return daysEntries.some(e => e.content?.toLowerCase().includes(lower) || e.meal_type?.toLowerCase().includes(lower)) ? 'match' : 'dim'
    }
    return 'has-entry'
  }

  // 1. 周数据 (柱状图 + 折线图)
  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(currentDate)
    const weekEnd = endOfWeek(currentDate)
    
    const data = Array(7).fill(0).map((_, i) => {
       const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]
       const dayObj: any = { name: dayName, totalScore: 0, count: 0 }
       MOODS.forEach(m => dayObj[m.name] = 0)
       return dayObj
    })

    entries.filter(e => {
      const d = parseISO(e.created_at)
      return d >= weekStart && d <= weekEnd
    }).forEach(e => {
      const dayIndex = getDay(parseISO(e.created_at))
      const moodConfig = MOODS.find(m => m.name === e.mood)
      const moodName = moodConfig?.name || 'Other'
      
      data[dayIndex][moodName] += 1
      data[dayIndex].totalScore += (moodConfig?.score || 3)
      data[dayIndex].count += 1
    })

    return data.map(d => ({
      ...d,
      // 计算平均分 (如果没数据就是null，折线图会断开，这很合理)
      avgScore: d.count > 0 ? parseFloat((d.totalScore / d.count).toFixed(1)) : null
    }))
  }, [entries, currentDate])

  // 2. 月数据
  const monthlyEntries = entries.filter(e => isSameMonth(parseISO(e.created_at), currentDate))
  const monthlyStats = useMemo(() => {
    const stats: Record<string, number> = {}
    monthlyEntries.forEach(e => {
      const mood = MOODS.find(m => m.name === e.mood)?.name || 'Other'
      stats[mood] = (stats[mood] || 0) + 1
    })
    return Object.entries(stats).map(([name, value]) => ({ name, value, color: MOODS.find(m => m.name === name)?.color })).sort((a, b) => b.value - a.value)
  }, [monthlyEntries])

  // 3. 年数据
  const yearlyData = useMemo(() => {
    const yearStart = startOfYear(currentDate)
    const yearEnd = endOfYear(currentDate)
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd })
    return months.map(m => {
       const monthEntries = entries.filter(e => isSameMonth(parseISO(e.created_at), m))
       const happyCount = monthEntries.filter(e => ['Joy','Excited','Proud','Love'].includes(e.mood)).length
       return { name: format(m, 'MMM'), happyCount, total: monthEntries.length }
    })
  }, [entries, currentDate])

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 md:p-8 flex flex-col items-center text-[#1F2937] pb-32 relative">
      
      {/* ✨ 锁定提示 Toast (浮在顶部) */}
      {lockMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-black/80 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 fade-in">
          <Lock size={16} className="text-orange-400" />
          <span className="text-sm font-bold">{lockMessage}</span>
        </div>
      )}

      <div className="max-w-lg w-full space-y-8">
        
        {/* 搜索栏 */}
        <div className="relative z-20">
          <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm p-2 focus-within:border-blue-200 transition-all">
            <Search size={20} className="text-gray-400 ml-2" />
            <input type="text" placeholder={filterMood ? `Filtered: ${filterMood}` : "Search..."} value={searchText} onChange={(e) => { setSearchText(e.target.value); setFilterMood(null) }} className="flex-1 px-3 py-2 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"/>
            <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`p-2 rounded-xl transition-colors flex items-center gap-2 ${filterMood ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
              {filterMood ? <><span className="text-lg">{MOODS.find(m => m.name === filterMood)?.emoji}</span><X size={14} onClick={(e) => { e.stopPropagation(); setFilterMood(null) }} /></> : <Filter size={18} />}
            </button>
          </div>
          {showFilterMenu && (
            <div className="absolute top-full right-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-4 animate-in fade-in z-50 flex flex-wrap gap-2">
               {MOODS.map(m => <button key={m.name} onClick={() => { setFilterMood(m.name); setSearchText(''); setShowFilterMenu(false) }} className="px-3 py-2 bg-gray-50 hover:bg-orange-50 border border-gray-100 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"><span>{m.emoji}</span> {m.name}</button>)}
            </div>
          )}
        </div>

        {/* 日历 */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-800 pl-1 tracking-tight">{format(currentDate, 'MMMM yyyy')}</h2>
            <div className="flex gap-2">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500"><ChevronLeft size={20}/></button>
              <button onClick={() => setCurrentDate(new Date())} className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200">Today</button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-500"><ChevronRight size={20}/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 mb-2">{['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-2">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
            {days.map((day) => {
              const status = checkDateStatus(day)
              const isToday = isSameDay(day, new Date())
              return (
                <div key={day.toString()} className="flex flex-col items-center justify-center aspect-square relative">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition-all ${isToday && status === 'empty' ? 'bg-black text-white' : ''} ${status === 'empty' && !isToday ? 'text-gray-400 hover:bg-gray-50' : ''} ${status === 'has-entry' ? 'bg-gray-100 text-gray-900 font-bold' : ''} ${status === 'match' ? 'bg-orange-400 text-white shadow-md scale-110 ring-2 ring-orange-100' : ''} ${status === 'dim' ? 'text-gray-200' : ''}`}>{format(day, 'd')}</div>
                  {status === 'has-entry' && !filterMood && !searchText && <div className="w-1 h-1 bg-gray-300 rounded-full mt-1"></div>}
                  {status === 'match' && <div className="w-1 h-1 bg-orange-200 rounded-full mt-1"></div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* --- 3. 统计分析中心 (Analytics Hub) --- */}
        <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm p-6">
          
          {/* 3.1 顶部切换条 */}
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
               <TrendingUp size={16} className="text-blue-500"/> Insights
             </h3>
             <div className="flex bg-gray-100 p-1 rounded-xl">
                {/* 这里把 onClick 逻辑改了，可以点击，然后触发提示 */}
                <button onClick={() => handleViewChange('week')} className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${statsView === 'week' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Week</button>
                <button onClick={() => handleViewChange('month')} className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize transition-all flex items-center gap-1 ${statsView === 'month' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {daysActive < 15 && <Lock size={8} />} Month
                </button>
                <button onClick={() => handleViewChange('year')} className={`px-3 py-1 rounded-lg text-[10px] font-bold capitalize transition-all flex items-center gap-1 ${statsView === 'year' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                  {daysActive < 60 && <Lock size={8} />} Year
                </button>
             </div>
          </div>

          {/* 3.2 图表内容区 */}
          <div className="w-full relative min-h-[200px]">
            
            {/* --- Week View: 两个图表分开显示 --- */}
            {statsView === 'week' && (
              <div className="space-y-8">
                {/* A. 情绪构成 (堆叠柱状图) */}
                <div className="h-40 w-full">
                   <div className="text-[10px] text-gray-400 font-bold mb-2 flex items-center gap-1"><BarChart2 size={10}/> MOOD COMPOSITION</div>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={weeklyData} barSize={12}>
                       <XAxis dataKey="name" tick={{fontSize: 10, fill:'#9CA3AF'}} axisLine={false} tickLine={false} dy={5} />
                       {/* 使用自定义 Tooltip */}
                       <RechartsTooltip content={<CustomTooltip />} cursor={{fill: '#F9FAFB'}} />
                       {MOODS.map(mood => (
                         <Bar key={mood.name} dataKey={mood.name} stackId="a" fill={mood.color} radius={[2,2,2,2]} />
                       ))}
                     </BarChart>
                   </ResponsiveContainer>
                </div>

                {/* B. 情绪趋势 (折线图) */}
                <div className="h-32 w-full border-t border-dashed border-gray-100 pt-4">
                   <div className="text-[10px] text-gray-400 font-bold mb-2 flex items-center gap-1"><TrendingUp size={10}/> EMOTIONAL FLOW (1-5 Score)</div>
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={weeklyData}>
                       <XAxis dataKey="name" tick={{fontSize: 10, fill:'#9CA3AF'}} axisLine={false} tickLine={false} dy={5} />
                       <YAxis domain={[1, 5]} hide />
                       <RechartsTooltip 
                          content={({active, payload}) => {
                            if (active && payload && payload.length) {
                              return <div className="bg-black text-white text-xs px-2 py-1 rounded">Score: {payload[0].value}</div>
                            }
                            return null
                          }}
                       />
                       <Line type="monotone" dataKey="avgScore" stroke="#3B82F6" strokeWidth={3} dot={{r:3, fill:'white', stroke:'#3B82F6', strokeWidth:2}} activeDot={{r:5}} connectNulls />
                     </LineChart>
                   </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* --- Month View --- */}
            {statsView === 'month' && (
              <div className="flex items-center h-48 gap-6">
                <div className="w-1/2 h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={monthlyStats} innerRadius={35} outerRadius={55} paddingAngle={4} dataKey="value">
                        {monthlyStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || '#ddd'} stroke="none" />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-bold text-gray-800">{monthlyEntries.length}</span>
                     <span className="text-[8px] text-gray-400 uppercase">Entries</span>
                  </div>
                </div>
                <div className="w-1/2 h-full overflow-y-auto pr-2 space-y-2">
                   {monthlyStats.map(stat => (
                     <div key={stat.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: stat.color }}></div><span className="font-bold text-gray-600">{stat.name}</span></div>
                        <span className="font-mono text-gray-400">{stat.value}</span>
                     </div>
                   ))}
                   {monthlyStats.length === 0 && <p className="text-xs text-gray-300">No data yet.</p>}
                </div>
              </div>
            )}

            {/* --- Year View --- */}
            {statsView === 'year' && (
              <ResponsiveContainer width="100%" height={200}>
                 <BarChart data={yearlyData} barSize={16}>
                    <XAxis dataKey="name" tick={{fontSize: 10, fill:'#9CA3AF'}} axisLine={false} tickLine={false} dy={10} />
                    <RechartsTooltip cursor={{fill: '#F9FAFB'}} contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                    <Bar dataKey="happyCount" fill="#FBBF24" radius={[4, 4, 4, 4]} name="Happy Days" />
                 </BarChart>
              </ResponsiveContainer>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}
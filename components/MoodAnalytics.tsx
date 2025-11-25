'use client'

import { useState, useMemo } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, ReferenceLine 
} from 'recharts'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, subDays, startOfMonth, endOfMonth, getWeek, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns'
import { Lock, ChevronDown } from 'lucide-react'

// 1. 心情打分表 (1-5分)
const MOOD_SCORES: Record<string, number> = {
  'Joy': 5, 'Excited': 5, 'Proud': 5, 'Love': 5,
  'Calm': 4,
  'Neutral': 3,
  'Tired': 2, 'Stressed': 2,
  'Sad': 1, 'Angry': 1, 'Crying': 1, 'Sick': 1,
  'Other': 3 // 默认中性
}

// 颜色定义
const COLORS = {
  high: '#FBBF24', // 5分 - 黄色
  mid: '#34D399',  // 3-4分 - 绿色
  low: '#818CF8',  // 1-2分 - 蓝色
  lineThick: '#111827', // 主线 - 黑色
  lineThin: '#E5E7EB',  // 辅线 - 浅灰
}

export default function MoodAnalytics({ entries, daysActive }: { entries: any[], daysActive: number }) {
  const [view, setView] = useState<'week' | 'month' | 'year'>('week')

  // --- 核心数据处理 ---
  const chartData = useMemo(() => {
    const today = new Date()
    let data = []

    // 辅助：计算某一天的平均分
    const getAvgScore = (date: Date) => {
      const dailyEntries = entries.filter(e => isSameDay(new Date(e.created_at), date))
      if (dailyEntries.length === 0) return null
      const total = dailyEntries.reduce((sum, e) => sum + (MOOD_SCORES[e.mood] || 3), 0)
      return total / dailyEntries.length
    }

    if (view === 'week') {
      // 周视图：最近7天
      const start = subDays(today, 6)
      const days = eachDayOfInterval({ start, end: today })
      data = days.map(day => ({
        label: format(day, 'EEE'), // Mon, Tue...
        fullDate: format(day, 'MMM d'),
        score: getAvgScore(day),
      }))
    } 
    else if (view === 'month') {
      // 月视图：本月所有天
      const start = startOfMonth(today)
      const end = today // 到今天为止
      const days = eachDayOfInterval({ start, end })
      
      // 计算每周平均分 (用于粗线)
      // 逻辑：先把每天的分数算出来，然后按周聚合
      data = days.map(day => {
        const dailyScore = getAvgScore(day)
        // 模拟周平均：这里为了图表好看，我们计算"截至目前的7天移动平均线"作为粗线
        // 或者简单的：如果是周日，计算这一周的平均分作为节点
        return {
          label: format(day, 'd'),
          score: dailyScore, // 细线：每天
          // 粗线逻辑：如果是每周的最后一天，或者月底，计算一下平均分，否则为null连接
          trend: dailyScore // 简化版：月视图里，Trend线可以是平滑处理后的曲线，这里先用原值，后面在图表里做平滑
        }
      })
    }
    else if (view === 'year') {
      // 年视图：12个月
      const start = startOfYear(today)
      const months = eachMonthOfInterval({ start, end: today })
      data = months.map(month => {
        // 找到这个月的所有 entries
        const monthEntries = entries.filter(e => isSameMonth(new Date(e.created_at), month))
        let avg = null
        if (monthEntries.length > 0) {
          const total = monthEntries.reduce((sum, e) => sum + (MOOD_SCORES[e.mood] || 3), 0)
          avg = total / monthEntries.length
        }
        return {
          label: format(month, 'MMM'),
          score: avg
        }
      })
    }

    return data
  }, [entries, view])

  // --- 自定义 Tooltip ---
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value
      let moodText = 'Neutral'
      if (score >= 4.5) moodText = 'Amazing 🤩'
      else if (score >= 4) moodText = 'Good 😊'
      else if (score >= 3) moodText = 'Okay 😐'
      else if (score >= 2) moodText = 'Low 😞'
      else moodText = 'Rough 😭'

      return (
        <div className="bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white text-xs">
          <p className="font-bold text-gray-500 mb-1">{label}</p>
          <p className="font-black text-lg text-gray-800">{score?.toFixed(1)} <span className="text-sm font-normal text-gray-400">/ 5.0</span></p>
          <p className={`font-bold mt-1 ${score>=4?'text-yellow-500':score>=3?'text-green-500':'text-blue-500'}`}>
            {moodText}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full bg-white rounded-[32px] border border-gray-200 shadow-sm p-6 mt-8">
      
      {/* 1. 顶部：标题 + 切换器 */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h3 className="text-lg font-black text-gray-800">Mood Rhythm</h3>
           <p className="text-xs text-gray-400 mt-1">Your emotional heartbeat over time.</p>
        </div>

        {/* 切换 Bar */}
        <div className="flex bg-gray-100 p-1 rounded-2xl">
           {/* Week Button */}
           <button 
             onClick={() => setView('week')}
             className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${view === 'week' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
           >
             Week
           </button>

           {/* Month Button (Locked < 15 days) */}
           <button 
             onClick={() => daysActive >= 15 && setView('month')}
             className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
               view === 'month' ? 'bg-white text-black shadow-sm' : 'text-gray-400'
             } ${daysActive < 15 ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-600'}`}
           >
             {daysActive < 15 && <Lock size={10} />} Month
           </button>

           {/* Year Button (Locked < 60 days) */}
           <button 
             onClick={() => daysActive >= 60 && setView('year')}
             className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
               view === 'year' ? 'bg-white text-black shadow-sm' : 'text-gray-400'
             } ${daysActive < 60 ? 'cursor-not-allowed opacity-50' : 'hover:text-gray-600'}`}
           >
             {daysActive < 60 && <Lock size={10} />} Year
           </button>
        </div>
      </div>

      {/* 2. 图表区域 */}
      <div className="h-64 w-full relative">
        
        {/* 装饰背景：5条虚线代表 1-5分 */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 pl-2 pr-2">
           {[5,4,3,2,1].map(i => (
             <div key={i} className="border-b border-dashed border-gray-100 w-full h-0 flex items-center">
               <span className="text-[8px] text-gray-200 -mt-4">{i}</span>
             </div>
           ))}
        </div>

        <ResponsiveContainer width="100%" height="100%">
          {view === 'month' ? (
            // 月视图：双线图
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#818CF8" />
                  <stop offset="50%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} cursor={{stroke: '#eee', strokeWidth: 2}} />
              {/* 细线：每天的实际波动 (Daily) */}
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#E5E7EB" // 浅灰色
                strokeWidth={2} 
                dot={{ r: 2, fill: '#E5E7EB' }} 
                activeDot={false}
                connectNulls
              />
              {/* 粗线：趋势 (Trend) - 这里用平滑曲线模拟周趋势 */}
              <Line 
                type="basis" // basis 插值会让线条更平滑，模拟周趋势
                dataKey="score" 
                stroke="url(#colorScore)" 
                strokeWidth={4} 
                dot={false}
                connectNulls
              />
            </LineChart>
          ) : (
            // 周/年视图：单线图
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FBBF24" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip content={<CustomTooltip />} cursor={{stroke: '#eee', strokeWidth: 2}} />
              <Line 
                type="monotone" // 平滑曲线
                dataKey="score" 
                stroke="#111827" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#fff', stroke: '#111827', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#FBBF24', stroke: 'none' }}
                connectNulls // 如果某天没日记，断点自动连上
              />
            </LineChart>
          )}
        </ResponsiveContainer>

      </div>

      {/* 3. 底部图例说明 */}
      <div className="flex justify-center gap-6 mt-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div> High (Joy)
         </div>
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-400"></div> Mid (Calm)
         </div>
         <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-indigo-400"></div> Low (Sad)
         </div>
      </div>

    </div>
  )
}
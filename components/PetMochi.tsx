'use client'

import { motion, useAnimation } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

export default function PetMochi({ lastFedAt }: { lastFedAt: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  // 1. 计算状态 (饿了就睡觉，饱了就活跃)
  const getStatus = () => {
    const lastFed = new Date(lastFedAt).getTime()
    const now = new Date().getTime()
    const hoursSince = (now - lastFed) / (1000 * 60 * 60)
    // 24小时内算活跃，否则算睡觉
    return hoursSince < 24 ? 'active' : 'sleep'
  }

  const status = getStatus()

  // 2. 鼠标追踪逻辑 (让眼睛跟着鼠标动)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // 计算鼠标相对于团子中心的位置 (-1 到 1)
      const x = (e.clientX - (rect.left + rect.width / 2)) / 20
      const y = (e.clientY - (rect.top + rect.height / 2)) / 20
      setMousePos({ x, y })
    }
    
    if (status === 'active') {
      window.addEventListener('mousemove', handleMouseMove)
    }
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [status])

  return (
    <div ref={containerRef} className="relative flex flex-col items-center justify-center py-10 h-64">
      
      {/* 🥣 容器：极简的陶瓷碗 (高级感) */}
      <div className="relative w-48 h-24">
        {/* 碗的后壁 (稍微暗一点) */}
        <div className="absolute bottom-0 w-full h-full bg-gray-100 rounded-b-[100px] border-2 border-white shadow-inner z-0"></div>
        
        {/* ✨✨✨ 主角：灵动团子 ✨✨✨ */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 bottom-4 z-10 cursor-pointer"
          initial={false}
          animate={status}
          variants={{
            active: {
              y: [0, -10, 0], // 呼吸浮动
              scale: [1, 1.05, 0.98, 1], // 软体弹性
              transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
            },
            sleep: {
              y: 10, // 瘫下去
              scaleX: 1.2, // 变扁
              scaleY: 0.8,
              transition: { duration: 0.5 }
            }
          }}
          whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.9, transition: { duration: 0.1 } }}
        >
          {/* 身体：高斯模糊 + 渐变 (像一块发光的玉) */}
          <div className="w-32 h-28 bg-gradient-to-b from-white to-orange-50 rounded-[45%] shadow-[0_0_30px_rgba(255,200,100,0.3)] border border-white/50 backdrop-blur-sm relative flex justify-center items-center">
            
            {/* 脸部 */}
            {status === 'active' ? (
              // 😳 醒着：眼睛跟随鼠标
              <div className="flex gap-6 mt-2">
                {/* 左眼 */}
                <div className="w-3 h-4 bg-gray-800 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="w-1 h-1 bg-white rounded-full absolute top-1 right-1"
                    animate={{ x: mousePos.x, y: mousePos.y }}
                  />
                </div>
                {/* 右眼 */}
                <div className="w-3 h-4 bg-gray-800 rounded-full relative overflow-hidden">
                   <motion.div 
                    className="w-1 h-1 bg-white rounded-full absolute top-1 right-1"
                    animate={{ x: mousePos.x, y: mousePos.y }}
                  />
                </div>
                {/* 腮红 */}
                <div className="absolute left-2 top-14 w-4 h-2 bg-red-200 rounded-full blur-sm opacity-60"></div>
                <div className="absolute right-2 top-14 w-4 h-2 bg-red-200 rounded-full blur-sm opacity-60"></div>
              </div>
            ) : (
              // 💤 睡着：闭眼 + 鼻涕泡
              <div className="relative mt-4">
                <div className="flex gap-6">
                  <div className="w-4 h-1 bg-gray-400 rounded-full rotate-12"></div>
                  <div className="w-4 h-1 bg-gray-400 rounded-full -rotate-12"></div>
                </div>
                {/* 鼻涕泡动画 */}
                <motion.div 
                  className="absolute -right-4 -top-4 w-6 h-6 bg-blue-100/50 rounded-full border border-blue-200"
                  animate={{ scale: [0.8, 1.5, 0.8], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                />
              </div>
            )}
            
          </div>
        </motion.div>

        {/* 碗的前壁 (半透明磨砂，挡住团子下半部分，营造“泡在碗里”的感觉) */}
        <div className="absolute bottom-0 w-full h-full bg-white/40 backdrop-blur-[2px] rounded-b-[100px] border-t border-white/50 z-20 pointer-events-none"></div>
      </div>

      {/* 状态文字 */}
      <div className="mt-6 flex flex-col items-center gap-1">
        <span className="text-xs font-bold tracking-widest text-gray-300 uppercase">
          {status === 'active' ? '● Online' : '○ Sleeping'}
        </span>
        <p className="text-sm text-gray-500 font-medium">
          {status === 'active' ? "I'm watching you 👀" : "Zzz... Feed me to wake up"}
        </p>
      </div>

    </div>
  )
}
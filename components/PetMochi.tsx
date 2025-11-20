'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

export default function PetMochi({ lastFedAt }: { lastFedAt: string }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // 状态逻辑：饿了就没精神
  const getStatus = () => {
    const lastFed = new Date(lastFedAt).getTime()
    const now = new Date().getTime()
    return (now - lastFed) / (1000 * 60 * 60) < 24 ? 'happy' : 'hungry'
  }
  const status = getStatus()

  // 眼神跟随逻辑 (让它活过来)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      // 限制眼球移动范围
      const x = (e.clientX - (rect.left + rect.width / 2)) / 15
      const y = (e.clientY - (rect.top + rect.height / 2)) / 15
      setMousePos({ x, y })
    }
    // 只有开心的时候才看人
    if (status === 'happy') {
      window.addEventListener('mousemove', handleMouseMove)
    }
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [status])

  return (
    // 容器：固定高度，防止变形
    <div ref={containerRef} className="relative flex flex-col items-center justify-end w-48 h-40 mx-auto shrink-0">
      
      {/* --- 1. 碗的后壁 (Back) --- */}
      <div className="absolute bottom-0 w-40 h-20 bg-[#E5E7EB] rounded-b-[100px] border-2 border-white shadow-inner z-0"></div>

      {/* --- 2. 团子本体 (Body) --- */}
      <motion.div
        className="relative z-10 mb-6 cursor-pointer"
        initial={false}
        animate={status === 'happy' ? {
          y: [0, -8, 0], // 呼吸浮动
          scaleY: [1, 1.05, 0.98, 1], // 软体弹性
        } : {
          y: 15, scaleY: 0.85 // 饿了瘫软
        }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* 身体材质：渐变 + 阴影 + 模糊边框 (像糯米滋) */}
        <div className={`w-32 h-28 rounded-[45%] border-2 border-white/60 backdrop-blur-sm shadow-[inset_-8px_-4px_20px_rgba(0,0,0,0.05)] flex justify-center items-center relative ${
           status === 'happy' ? 'bg-gradient-to-b from-white to-orange-50' : 'bg-gradient-to-b from-gray-100 to-blue-50'
        }`}>
          
          {/* 表情区域 */}
          <div className="relative top-2">
            {status === 'happy' ? (
              <>
                {/* 眼睛 */}
                <div className="flex gap-6">
                  <div className="w-3 h-4 bg-gray-800 rounded-full relative overflow-hidden">
                     <motion.div className="w-1 h-1 bg-white rounded-full absolute top-1 right-1" animate={mousePos} />
                  </div>
                  <div className="w-3 h-4 bg-gray-800 rounded-full relative overflow-hidden">
                     <motion.div className="w-1 h-1 bg-white rounded-full absolute top-1 right-1" animate={mousePos} />
                  </div>
                </div>
                {/* 腮红 (灵魂所在！) */}
                <div className="absolute -left-2 top-3 w-4 h-2 bg-pink-300 rounded-full blur-md opacity-60"></div>
                <div className="absolute -right-2 top-3 w-4 h-2 bg-pink-300 rounded-full blur-md opacity-60"></div>
                {/* 嘴巴 */}
                <div className="w-2 h-1 bg-gray-800/50 rounded-full mx-auto mt-1"></div>
              </>
            ) : (
              // 饿了的表情
              <div className="flex flex-col items-center gap-1 mt-2">
                 <div className="flex gap-6">
                    <div className="w-3 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-3 h-1 bg-gray-400 rounded-full"></div>
                 </div>
                 <div className="text-blue-300 text-xs font-bold">Zzz...</div>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      {/* --- 3. 碗的前壁 (Front Glass) --- */}
      {/* 半透明，挡住团子的下半身，营造“坐在里面”的感觉 */}
      <div className="absolute bottom-0 w-40 h-20 bg-white/40 backdrop-blur-[2px] rounded-b-[100px] border-t border-white/80 z-20 pointer-events-none overflow-hidden">
         {/* 高光反射 */}
         <div className="absolute top-2 right-4 w-10 h-4 bg-white rounded-full opacity-40 rotate-[-15deg] blur-[1px]"></div>
      </div>
      
      {/* 阴影 */}
      <div className="absolute -bottom-4 w-32 h-4 bg-black/10 blur-md rounded-[100%] z-[-1]"></div>

    </div>
  )
}
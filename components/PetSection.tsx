'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function PetMochi({ lastFedAt }: { lastFedAt: string }) {
  // 简单的状态判断
  const getStatus = () => {
    const lastFed = new Date(lastFedAt).getTime()
    const now = new Date().getTime()
    return (now - lastFed) / (1000 * 60 * 60) < 24 ? 'active' : 'hungry'
  }
  const status = getStatus()

  return (
    <div className="relative w-40 h-32 flex items-end justify-center">
      
      {/* --- 1. 碗的后壁 (营造厚度感) --- */}
      <div className="absolute bottom-0 w-32 h-16 bg-gray-100 rounded-b-[60px] border-2 border-white shadow-inner z-0"></div>

      {/* --- 2. 团子本体 (有五官！) --- */}
      <motion.div
        className="relative z-10 mb-4 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.85, rotate: -5 }} // 点击缩一下，很有弹性
        animate={status === 'active' ? {
          y: [0, -4, 0], // 呼吸
        } : {
          y: 5, // 饿了瘫着
        }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        {/* 身体 */}
        <div className="w-24 h-20 bg-white rounded-[45%] shadow-[inset_-5px_-5px_15px_rgba(0,0,0,0.05)] border border-white flex justify-center items-center relative">
          
          {/* 表情包 (根据截图还原) */}
          <div className="absolute top-6 flex flex-col items-center gap-1">
            {/* 眼睛和腮红 */}
            <div className="flex items-center gap-3">
               {/* 左腮红 */}
               <div className="w-2 h-1 bg-pink-200 rounded-full blur-[1px]"></div>
               {/* 左眼 */}
               <div className="w-2.5 h-3.5 bg-gray-800 rounded-full"></div>
               {/* 右眼 */}
               <div className="w-2.5 h-3.5 bg-gray-800 rounded-full"></div>
               {/* 右腮红 */}
               <div className="w-2 h-1 bg-pink-200 rounded-full blur-[1px]"></div>
            </div>
            
            {/* 嘴巴 (SVG 微笑) */}
            <svg width="12" height="6" viewBox="0 0 12 6" fill="none" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round">
               <path d="M1 1C1 1 3.5 5 6 5C8.5 5 11 1 11 1" />
            </svg>
          </div>

        </div>
      </motion.div>

      {/* --- 3. 碗的前壁 (半透明玻璃感) --- */}
      {/* 盖住团子下半身，产生“在碗里”的效果 */}
      <div className="absolute bottom-0 w-32 h-16 bg-white/60 backdrop-blur-[2px] rounded-b-[60px] border-t border-white/80 z-20 pointer-events-none overflow-hidden">
         {/* 高光 */}
         <div className="absolute top-2 right-4 w-6 h-2 bg-white rounded-full opacity-60 rotate-[-15deg]"></div>
      </div>

    </div>
  )
}
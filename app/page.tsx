'use client'

import Link from 'next/link'
import LoginForm from '@/components/LoginForm'
import PetMochi from '@/components/PetMochi'

// 社交媒体图标
const SocialIcon = ({ href, path, viewBox = "0 0 24 24" }: { href: string, path: string, viewBox?: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all shadow-sm border border-gray-100">
    <svg viewBox={viewBox} fill="currentColor" className="w-5 h-5"><path d={path} /></svg>
  </a>
)

export default function LandingPage() {
  
  // 点击 Sign In 的动作：聚焦到输入框
  const scrollToLogin = () => {
    const input = document.querySelector('input[type="email"]') as HTMLInputElement
    if (input) {
      input.focus()
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      
      {/* 1. Navbar (首页专用) */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 bg-[#FAFAFA]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
           <div className="text-2xl font-black tracking-tighter">Ourbowl<span className="text-[#F5C066]">.</span></div>
           <button 
             onClick={scrollToLogin}
             className="px-6 py-2.5 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg hover:scale-105"
           >
             Sign In / Join
           </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
           
           {/* Left: Intro */}
           <div className="space-y-8 relative z-10">
              <div className="inline-block px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold tracking-wider border border-orange-100">
                 ✨ NEW: FOOD & MOOD TRACKING
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-gray-900">
                Nourish Body,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F5C066] to-[#FF9A9E]">Soothe Soul.</span>
              </h1>
              
              <p className="text-lg text-gray-500 leading-relaxed max-w-md">
                Welcome to <b>Ourbowl</b>. A mindful companion to seamlessly record your meals, moods, and moments with your pets. 
              </p>

              {/* 装饰用的团子 (点击会有提示) */}
              <div 
                className="w-full h-48 bg-white rounded-[32px] flex flex-col items-center justify-center border border-gray-100 relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all"
                onClick={scrollToLogin}
              >
                 <div className="scale-90 mt-4 pointer-events-none">
                    {/* 这里放个假的日期让它显示 */}
                    <PetMochi lastFedAt={new Date().toISOString()} />
                 </div>
                 <div className="absolute bottom-4 text-xs font-bold text-gray-300 bg-gray-50 px-3 py-1 rounded-full group-hover:text-orange-400 group-hover:bg-orange-50 transition-colors">
                    Login to adopt me! ⤴
                 </div>
              </div>
           </div>

           {/* Right: Login Form */}
           <div className="relative z-10">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl"></div>
              
              <LoginForm />
           </div>
        </div>
      </div>

      {/* ... Footer 部分保持不变 ... */}
      {/* 4. Footer */}
      <footer className="bg-[#FAFAFA] border-t border-gray-200 pt-16 pb-8 px-6">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Logo & Rights */}
            <div className="text-center md:text-left">
               <div className="text-xl font-black mb-2">Ourbowl.</div>
               <p className="text-xs text-gray-400">© 2025 Ourbowl. All rights reserved.</p>
            </div>

            {/* Links (新增了 Feedback) */}
            <div className="flex gap-6 text-xs font-bold text-gray-500 flex-wrap justify-center">
               <Link href="/accessibility" className="hover:text-black transition-colors">Accessibility</Link>
               <Link href="/terms" className="hover:text-black transition-colors">Terms & Conditions</Link>
               <Link href="/feedback" className="hover:text-black transition-colors text-orange-500">Feedback / Bug Report</Link>
               <a href="mailto:contact.ourbowl@gmail.com" className="hover:text-black transition-colors">Contact Us</a>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
               {/* Instagram */}
               <SocialIcon 
                 href="https://www.instagram.com/ourbowl2025?igsh=MWw4OHlhcGRha2tjeA%3D%3D&utm_source=qr"
                 path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
               />
               {/* TikTok */}
               <SocialIcon 
                 href="https://www.tiktok.com/@ourbowl3?_r=1&_t=ZN-91Yjt0r1WOh"
                 path="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93v6.14c0 3.48-2.43 6.54-5.91 6.83-3.95.33-7.39-2.58-7.65-6.48-.25-3.75 2.58-7.08 6.33-7.36.69-.05 1.38-.02 2.07.08v4.05c-.36-.1-.74-.15-1.12-.12-1.7.13-2.98 1.63-2.85 3.34.12 1.61 1.52 2.84 3.14 2.74 1.54-.09 2.77-1.39 2.73-2.94V.02z"
               />
               {/* XiaoHongShu (小红书正版 SVG Path) */}
               <SocialIcon 
                 href="https://www.xiaohongshu.com/user/profile/684bfce5000000001d0098dc?xsec_token=YBvnYnru1_mzqhgd323jt6MeNpNUfG1vYnJrd0Y8G2xOw=&xsec_source=app_share&xhsshare=CopyLink&shareRedId=OD42QklIST42NzUyOTgwNjdHOTc9PUpM&apptime=1763567119&share_id=767929dfb8f6414fac59d7bc1c925255"
                 viewBox="0 0 1024 1024"
                 // 这是一个更准确的“毛笔字”风格的小红书 Logo 路径
                 path="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm246.6 416.1c-5.6 103.6-71.9 163.7-131.9 179.1v11.2c24.7 8.9 41.6 30.9 41.6 58.5 0 35.5-26.7 64.4-59.6 64.4-32.9 0-59.6-28.9-59.6-64.4 0-20.2 9.1-37.3 23.2-49.3v-11.8c-32.8-10.6-63.9-30.5-87.3-61.2-31.9-41.9-44.8-101.2-44.8-101.2s-70.4 0-70.4 95.6c0 20.7 16.8 37.5 37.5 37.5 20.7 0 37.5-16.8 37.5-37.5 0-13.5-7.2-25.4-17.9-32.1 11.3-15.7 29.7-25.9 50.4-25.9 34.5 0 62.5 28 62.5 62.5 0 34.5-28 62.5-62.5 62.5-34.5 0-62.5-28-62.5-62.5 0-6.9 1.1-13.5 3.2-19.7-45.4 15.6-78.2 58.7-78.2 109.7 0 63.8 51.7 115.5 115.5 115.5 63.8 0 115.5-51.7 115.5-115.5 0-5.2-.4-10.3-1-15.3 30.9 10.6 65.4 16.3 101.5 16.3 108.1 0 195.7-50.3 236.6-126.2-14.6 3.9-30.1 6-46.1 6-92.6 0-167.8-75.1-167.8-167.8 0-13.4 1.6-26.4 4.6-38.9-65.2 16.3-112.3 71.5-114.6 138.5z"
               />
            </div>
         </div>
      </footer>
    </div>
  )
}
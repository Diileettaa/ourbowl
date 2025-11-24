'use client'

import Link from 'next/link'
import LoginForm from '@/components/LoginForm'
import PetMochi from '@/components/PetMochi' // 借用你的小团子来装饰

// 社交媒体图标 (SVG)
const SocialIcon = ({ href, path, viewBox = "0 0 24 24" }: { href: string, path: string, viewBox?: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:scale-110 transition-all shadow-sm border border-gray-100">
    <svg viewBox={viewBox} fill="currentColor" className="w-5 h-5"><path d={path} /></svg>
  </a>
)

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827]">
      
      {/* 1. Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
           <div className="text-2xl font-black tracking-tighter">Ourbowl<span className="text-[#F5C066]">.</span></div>
           {/* 移动端可能需要隐藏这个按钮，因为Form就在屏幕上 */}
           <button className="hidden md:block px-5 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
             Sign In
           </button>
        </div>
      </nav>

      {/* 2. Hero Section (介绍 + 登录) */}
      <div className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
           
           {/* Left: Intro Text */}
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
                Rediscover well-being through awareness, not strict plans.
              </p>

              {/* 装饰用的团子 */}
              <div className="w-full h-40 bg-gray-50 rounded-3xl flex items-center justify-center border border-gray-100 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-gray-400">Meet Mochi ⤴</span>
                 </div>
                 <div className="scale-75 mt-10 grayscale group-hover:grayscale-0 transition-all duration-500">
                    <PetMochi lastFedAt={new Date().toISOString()} />
                 </div>
              </div>
           </div>

           {/* Right: Login Form */}
           <div className="relative z-10">
              {/* 装饰背景光 */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-200/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-200/20 rounded-full blur-3xl"></div>
              
              <LoginForm />
           </div>
        </div>
      </div>

      {/* 3. Our Story Section */}
      <div className="bg-white border-t border-gray-100 py-24 px-6">
         <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold">Our Story</h2>
            <div className="w-16 h-1 bg-[#F5C066] mx-auto rounded-full"></div>
            <p className="text-xl text-gray-500 leading-loose font-medium">
              "Ourbowl was created to help people become healthier through <span className="text-gray-900">awareness and connection</span>, not strict plans. 
              We provide a calm space for you to find rhythm and rediscover well-being. 
              By tracking your emotions, meals, and moments with loved ones, you may discover fulfillment and can choose to share your joy or express thoughts anonymously."
            </p>
         </div>
      </div>

      {/* 4. Footer */}
      <footer className="bg-[#FAFAFA] border-t border-gray-200 pt-16 pb-8 px-6">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            
            {/* Logo & Rights */}
            <div className="text-center md:text-left">
               <div className="text-xl font-black mb-2">Ourbowl.</div>
               <p className="text-xs text-gray-400">© 2025 Ourbowl. All rights reserved.</p>
            </div>

            {/* Links */}
            <div className="flex gap-6 text-xs font-bold text-gray-500">
               <Link href="/accessibility" className="hover:text-black transition-colors">Accessibility</Link>
               <Link href="/terms" className="hover:text-black transition-colors">Terms & Conditions</Link>
               <a href="mailto:contact@ourbowl.net" className="hover:text-black transition-colors">Contact Us</a>
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
               {/* XiaoHongShu (Custom Shape) */}
               <SocialIcon 
                 href="https://www.xiaohongshu.com/user/profile/684bfce5000000001d0098dc?xsec_token=YBvnYnru1_mzqhgd323jt6MeNpNUfG1vYnJrd0Y8G2xOw=&xsec_source=app_share&xhsshare=CopyLink&shareRedId=OD42QklIST42NzUyOTgwNjdHOTc9PUpM&apptime=1763567119&share_id=767929dfb8f6414fac59d7bc1c925255"
                 viewBox="0 0 1024 1024"
                 path="M163.63 226.78c-18.26 12.86-32.76 29.53-42.51 48.28-9.15 17.59-13.83 37.62-14.31 58.49 0 0-6.13 229.99-6.13 248.37 0 24.51 6.13 36.76 6.13 36.76 10.21 30.63 28.59 46.98 28.59 46.98 34.72 34.72 85.77 49.02 85.77 49.02 18.38 4.08 65.36 2.04 65.36 2.04 4.08 12.25 10.21 24.51 18.38 34.72 34.72 42.89 91.9 59.23 142.95 59.23 49.02 0 104.16-16.34 138.87-55.15 10.21-10.21 16.34-22.47 20.42-34.72 16.34 0 55.15 0 67.41-2.04 53.1-8.17 102.11-36.76 130.7-83.73 14.3-22.47 20.42-49.02 20.42-49.02 2.04-36.76 2.04-174.83 2.04-201.38 0-38.8-14.3-77.61-38.8-106.2-26.55-32.68-67.41-51.06-108.24-53.1-36.76-2.04-128.66 0-128.66 0V65.43h-138.87v55.15s-81.69-4.09-116.41 2.04c-42.89 8.18-83.73 34.73-108.24 63.32-12.26 12.26-20.43 26.55-24.51 40.85h-4.09z m518.74 446.42c-12.26 20.42-40.85 32.68-65.36 34.72-28.59 2.04-51.06-6.13-61.27-14.3l-10.21-6.13 20.42-28.59c22.47-32.68 34.72-75.57 32.68-116.41l-2.04-14.3 14.3 2.04c30.63 2.04 59.23 14.3 81.69 36.76 20.42 20.42 30.63 49.02 28.59 77.61-2.04 14.29-14.3 24.5-38.8 28.6zM245.32 267.63c12.25-14.3 28.59-22.47 49.02-24.51 30.63-4.09 124.58-2.04 124.58-2.04v307.54c0 57.19-40.85 104.16-95.99 110.29-53.1 6.13-102.11-28.59-114.36-79.65-2.04-6.13-2.04-12.25-2.04-18.38 0-6.13-4.08-10.21-10.21-12.25-6.13-2.04-12.25 2.04-14.3 8.17-2.04 12.25-2.04 24.51 0 36.76 16.34 65.36 79.65 110.29 149.09 102.11 69.44-8.17 122.54-67.41 122.54-136.84V241.08s89.86-2.04 120.5 2.04c20.42 2.04 40.85 12.25 53.1 28.59 14.3 16.34 20.42 36.76 20.42 57.19 0 20.42 0 151.13 0 165.43 0 18.38-2.04 32.68-14.3 46.97-26.55 32.68-69.44 36.76-83.73 36.76l-26.55-2.04c2.04-6.13 4.09-12.25 6.13-18.38 16.34-51.06 2.04-108.24-36.76-147.04-28.59-26.55-65.36-40.85-104.16-40.85h-12.25v161.34c-4.09 2.04-10.21 2.04-14.3 0V245.17s-91.9-4.09-122.54 0c-20.42 2.04-38.8 12.25-51.06 28.59-12.26 16.34-20.43 38.8-18.38 61.27 0 0 0 142.96 0 165.43 0 18.38 2.04 36.76 14.3 49.02 12.25 12.26 24.51 14.3 30.63 14.3h6.13c-2.04 6.13-2.04 12.25-2.04 18.38-2.04 4.08-6.13 8.17-10.21 8.17-22.47-2.04-44.93-14.3-61.27-30.63-16.34-18.38-22.47-42.89-22.47-67.41 0-18.38-2.04-163.38-2.04-183.81-2.04-24.51 6.13-46.98 18.38-63.32 14.29-14.3 30.63-22.47 51.06-24.52z"
               />
            </div>
         </div>
      </footer>

    </div>
  )
}
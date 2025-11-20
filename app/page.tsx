'use client'
import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('') // 验证码
  const [step, setStep] = useState<'login' | 'verify'>('login') // 当前步骤
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  // 1. 处理 Google 登录
  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // 登录成功后跳去哪里
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setMessage(error.message)
    // 注意：Google 登录会跳离当前页面，所以不需要 setLoading(false)
  }

  // 2. 发送验证码 (OTP)
  const handleSendCode = async () => {
    if (!email) return alert("Please enter email")
    setLoading(true)
    setMessage('')
    
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true, // 如果没注册，自动注册
      },
    })

    if (error) {
      setMessage('Error: ' + error.message)
      setLoading(false)
    } else {
      setMessage('✅ Code sent! Check your email.')
      setStep('verify') // 切换到输入验证码界面
      setLoading(false)
    }
  }

  // 3. 验证验证码
  const handleVerifyCode = async () => {
    if (!otp) return alert("Please enter code")
    setLoading(true)

    const { error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    })

    if (error) {
      setMessage('❌ Wrong code: ' + error.message)
      setLoading(false)
    } else {
      // 验证成功！跳转到 Dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-gray-800 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-[32px] shadow-xl border border-gray-100 text-center">
        
        {/* Logo */}
        <div className="mb-6 text-6xl">🥣</div>
        <h1 className="text-3xl font-bold mb-2 text-[#8D99AE]">Ourbowl</h1>
        <p className="text-gray-400 mb-8 text-sm">Track moods, soothe your soul.</p>

        {/* STEP 1: 输入邮箱 / Google 登录 */}
        {step === 'login' && (
          <div className="flex flex-col gap-4">
            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full p-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="G" />
              Continue with Google
            </button>

            <div className="flex items-center gap-2 opacity-50 my-2">
              <div className="h-px bg-gray-300 flex-1"></div>
              <span className="text-xs">OR</span>
              <div className="h-px bg-gray-300 flex-1"></div>
            </div>

            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFD166] transition-all"
            />
            
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="w-full p-4 bg-[#FFD166] text-white font-bold rounded-2xl hover:bg-[#FFC145] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Code'}
            </button>
          </div>
        )}

        {/* STEP 2: 输入验证码 */}
        {step === 'verify' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4">
            <p className="text-sm text-gray-500">Enter the code sent to <br/><b>{email}</b></p>
            
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FFD166] text-center text-2xl tracking-widest font-mono transition-all"
              maxLength={6}
            />
            
            <button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full p-4 bg-[#FFD166] text-white font-bold rounded-2xl hover:bg-[#FFC145] active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button 
              onClick={() => { setStep('login'); setMessage('') }}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Back to Email
            </button>
          </div>
        )}

        {/* Message Toast */}
        {message && (
          <div className="mt-6 p-3 bg-blue-50 text-blue-600 rounded-xl text-sm animate-bounce">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
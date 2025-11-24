'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'login' | 'verify'>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setMessage(error.message)
  }

  const handleSendCode = async () => {
    if (!email) return alert("Please enter email")
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: { shouldCreateUser: true },
    })
    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      setStep('verify')
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!otp) return alert("Please enter code")
    setLoading(true)
    const { error } = await supabase.auth.verifyOtp({
      email: email, token: otp, type: 'email',
    })
    if (error) {
      setMessage(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="bg-white p-8 rounded-[32px] shadow-xl border border-white/50 w-full max-w-md mx-auto backdrop-blur-sm">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🥣</div>
        <h2 className="text-2xl font-black text-gray-800">Welcome Back</h2>
        <p className="text-gray-400 text-sm mt-1">Your mindful journey starts here.</p>
      </div>

      {step === 'login' ? (
        <div className="space-y-4">
          <button onClick={handleGoogleLogin} disabled={loading} className="w-full p-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 transition-all active:scale-95">
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
             Continue with Google
          </button>
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-300 text-xs font-bold">OR EMAIL</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>
          <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all font-medium" />
          <button onClick={handleSendCode} disabled={loading} className="w-full p-4 bg-[#F5C066] text-white font-bold rounded-2xl hover:bg-[#E0A845] active:scale-95 transition-all shadow-lg shadow-orange-100">
            {loading ? 'Sending...' : 'Send Code'}
          </button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
          <p className="text-sm text-gray-500 text-center">Code sent to <b>{email}</b></p>
          <input type="text" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-100 text-center text-2xl tracking-[0.5em] font-mono" maxLength={6} />
          <button onClick={handleVerifyCode} disabled={loading} className="w-full p-4 bg-[#F5C066] text-white font-bold rounded-2xl hover:bg-[#E0A845] active:scale-95 transition-all shadow-lg shadow-orange-100">
            {loading ? 'Verifying...' : 'Verify & Login'}
          </button>
          <button onClick={() => setStep('login')} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-2">Back</button>
        </div>
      )}
      {message && <div className="mt-4 p-3 bg-red-50 text-red-500 text-xs rounded-xl text-center">{message}</div>}
    </div>
  )
}
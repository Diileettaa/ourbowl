'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] p-4 text-[#2D3748]">
      <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 text-center max-w-md w-full">
        
        <div className="text-6xl mb-6">🤔</div>
        
        <h1 className="text-2xl font-bold mb-4 text-[#8D99AE]">
          Login Issue
        </h1>
        
        <p className="text-gray-500 mb-6 leading-relaxed">
          {error ? (
            <span className="font-mono bg-red-50 text-red-500 px-2 py-1 rounded text-sm">
              {error}
            </span>
          ) : (
            "Something went wrong during login."
          )}
        </p>
        
        <Link 
          href="/"
          className="block w-full py-4 bg-[#FFD166] text-white font-bold rounded-2xl hover:bg-[#FFC145] transition-all shadow-md active:scale-95"
        >
          Try Again
        </Link>

      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] p-4 text-[#2D3748]">
      <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 text-center max-w-md w-full">
        
        {/* Icon */}
        <div className="text-6xl mb-6">🍃</div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold mb-4 text-[#8D99AE]">
          Link Expired
        </h1>
        
        {/* Explanation */}
        <p className="text-gray-500 mb-8 leading-relaxed">
          The login link is invalid or has already been used.
          <br />
          <span className="text-xs opacity-70">
            (Some email clients scan links automatically, which might consume the one-time token.)
          </span>
        </p>
        
        {/* Action Button */}
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
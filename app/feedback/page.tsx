'use client'

import { useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { ArrowLeft, Send, Mail } from 'lucide-react'
import Link from 'next/link'

export default function FeedbackPage() {
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return alert("Please enter some feedback.")
    
    setIsSubmitting(true)

    // 1. 存入数据库 (双重保险)
    const { error } = await supabase.from('feedback').insert({
      content,
      contact_info: contact
    })

    if (error) {
      alert("Error saving feedback, please try emailing us directly.")
    } else {
      // 2. 尝试唤起用户邮箱发送 (因为前端无法直接发邮件给你的邮箱)
      // 这会打开用户手机/电脑上的邮件App，草稿里填好了内容
      const subject = encodeURIComponent("Ourbowl Feedback")
      const body = encodeURIComponent(`Feedback:\n${content}\n\nContact: ${contact}`)
      window.location.href = `mailto:contact.ourbowl@gmail.com?subject=${subject}&body=${body}`
      
      alert("Thank you! Your feedback has been saved.")
      setContent('')
      setContact('')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 flex flex-col items-center justify-center text-[#111827]">
      
      <div className="w-full max-w-md bg-white p-8 rounded-[32px] shadow-xl border border-gray-100">
        
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-black mb-6 text-sm font-bold transition-colors">
           <ArrowLeft size={16} /> Back Home
        </Link>

        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
             💌
           </div>
           <h1 className="text-2xl font-black text-gray-900">Feedback & Bug Report</h1>
           <p className="text-gray-500 text-sm mt-2">
             Found a bug? Have an idea? We'd love to hear from you.
           </p>
        </div>

        <div className="space-y-4">
           <div>
             <label className="text-xs font-bold text-gray-400 uppercase ml-1">Your Feedback</label>
             <textarea 
               value={content}
               onChange={e => setContent(e.target.value)}
               className="w-full h-32 p-4 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 mt-1 resize-none text-sm"
               placeholder="Tell us what you think..."
             />
           </div>

           <div>
             <label className="text-xs font-bold text-gray-400 uppercase ml-1">Your Email (Optional)</label>
             <input 
               type="text"
               value={contact}
               onChange={e => setContact(e.target.value)}
               className="w-full p-3 bg-gray-50 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 mt-1 text-sm"
               placeholder="So we can reply to you..."
             />
           </div>

           <button 
             onClick={handleSubmit}
             disabled={isSubmitting}
             className="w-full py-3 bg-black text-white rounded-2xl font-bold hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             {isSubmitting ? 'Sending...' : 'Send Feedback'} <Send size={16} />
           </button>

           <p className="text-center text-xs text-gray-400 mt-4">
             Or email us directly: <br/>
             <a href="mailto:contact.ourbowl@gmail.com" className="text-orange-500 hover:underline">contact.ourbowl@gmail.com</a>
           </p>
        </div>

      </div>
    </div>
  )
}
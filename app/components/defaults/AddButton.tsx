import Link from 'next/link'
import { Plus } from 'lucide-react'

export function AddButton() {
  return (
    <Link 
      href="/subscriptions/new"
      className="group fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full shadow-2xl transition-all duration-300 ease-in-out hover:scale-110 hover:shadow-emerald-500/25 z-50 flex items-center justify-center"
      aria-label="Add subscription"
    >
      <Plus 
        size={28} 
        className="transition-transform duration-300 group-hover:rotate-90" 
      />
      
      <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20"></div>
      
      <div className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
        Add Subscription
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-800 border-y-4 border-y-transparent"></div>
      </div>
    </Link>
  )
}
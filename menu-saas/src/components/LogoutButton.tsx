'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh() // Obliga al Middleware a re-evaluar la sesión
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
    >
      Cerrar Sesión
    </button>
  )
}
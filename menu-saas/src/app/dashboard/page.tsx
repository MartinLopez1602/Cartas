import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import ProductTable from '@/components/ProductTable'

export default async function Dashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

 // Modifica la parte donde traes el restaurante:
const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*, products(*), categories(*)') // Añadimos categories(*) aquí
    .eq('owner_id', user.id)
    .single()

  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de {restaurant?.name}</h1>
          <p className="text-sm text-gray-500 font-medium">Usuario: {user.email}</p>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton />
        </div>
      </header>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Tus Platos</h2>
        {/* El botón lo pondremos dentro de un componente Client para manejar el estado del modal */}
      </div>
      {/* Aquí le pasamos los datos al componente que SI tiene los botones */}
      <ProductTable 
        products={restaurant?.products || []} 
        categories={restaurant?.categories || []} 
        restaurantId={restaurant?.id} 
      />
    </div>
  )
}
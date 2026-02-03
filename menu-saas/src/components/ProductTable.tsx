'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import EditPriceModal from './EditPriceModal'
import AddProductModal from './AddProductModal' // 1. Importamos el nuevo modal

// 2. Agregamos categories y restaurantId a las props
export default function ProductTable({ 
  products, 
  categories, 
  restaurantId 
}: { 
  products: any[], 
  categories: any[], 
  restaurantId: string 
}) {
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [isAdding, setIsAdding] = useState(false) // 3. Estado para controlar el modal de añadir
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', id)

    if (!error) {
      router.refresh()
    }
  }

  return (
    <>
      {/* 4. Botón para añadir nuevo producto arriba de la tabla */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Gestión de Platos</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black transition-all flex items-center gap-2 shadow-lg active:scale-95"
        >
          <span className="text-lg">+</span> Añadir Producto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-widest text-gray-400 font-black">
              <th className="p-4">Producto</th>
              <th className="p-4">Precio</th>
              <th className="p-4 text-center">Disponibilidad</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-gray-800">{product.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[150px]">{product.description}</div>
                </td>
                <td className="p-4 font-mono font-bold text-blue-600">${product.price}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => toggleAvailability(product.id, product.is_available)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
                      product.is_available 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    {product.is_available ? '● Activo' : '○ Agotado'}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setEditingProduct(product)}
                    className="text-gray-400 hover:text-blue-600 font-bold text-sm p-2 transition-colors"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. Renderizado condicional del modal de añadir */}
      {isAdding && (
        <AddProductModal 
          restaurantId={restaurantId} 
          categories={categories} 
          onClose={() => setIsAdding(false)} 
        />
      )}

      {editingProduct && (
        <EditPriceModal 
          product={editingProduct} 
          onClose={() => setEditingProduct(null)} 
        />
      )}
    </>
  )
}
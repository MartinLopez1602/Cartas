// src/app/[slug]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function PublicMenu({ params }: { params: { slug: string } }) {
  const supabase = createServerComponentClient({ cookies });

  // 1. Obtener los datos del restaurante por su slug
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('*, categories(*, products(*))')
    .eq('slug', params.slug)
    .single();

  if (!restaurant) return <div>Restaurante no encontrado.</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold" style={{ color: restaurant.primary_color }}>
          {restaurant.name}
        </h1>
      </header>

      {restaurant.categories.map((category: any) => (
        <section key={category.id} className="mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">{category.name}</h2>
          <div className="grid gap-4">
            {category.products.map((product: any) => (
              <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between">
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-500">{product.description}</p>
                </div>
                <span className="font-bold text-green-700">${product.price}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
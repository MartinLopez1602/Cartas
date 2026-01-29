import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicMenu({ params }: PageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignorar errores en Server Components
          }
        },
      },
    }
  );

  const { data: restaurant, error } = await supabase
    .from('restaurants')
    .select('*, categories(*, products(*))')
    .eq('slug', slug)
    .single();

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Restaurante no encontrado
          </h1>
          <p className="text-gray-600">
            El menú que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      {/* ... header igual ... */}

      <div className="max-w-4xl mx-auto space-y-8">
        {restaurant.categories
          // Cambiado: a.order -> a.order_index
          ?.sort((a: any, b: any) => a.order_index - b.order_index)
          .map((category: any) => (
            <section key={category.id} className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
                {category.name}
              </h2>
              <div className="space-y-4">
                {category.products
                  // Cambiado: product.available -> product.is_available
                  ?.filter((product: any) => product.is_available !== false)
                  .map((product: any) => (
                    <div
                      key={product.id}
                      className="flex gap-4 items-start hover:bg-gray-50 p-4 rounded-xl transition-colors"
                    >
                      {/* Usamos un <img> normal por ahora o configuramos dominios en next.config.js */}
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="rounded-lg object-cover w-20 h-20 bg-gray-100"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-500 mt-1 leading-tight">
                            {product.description}
                          </p>
                        )}
                      </div>
                      <span 
                        className="font-black text-xl whitespace-nowrap"
                        style={{ color: restaurant.primary_color }}
                      >
                        ${Number(product.price).toLocaleString('es-CL')}
                      </span>
                    </div>
                  ))}
              </div>
            </section>
          ))}
      </div>
    </main>
  );
}

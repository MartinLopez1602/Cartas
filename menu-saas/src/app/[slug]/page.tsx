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
    <>
      {/* Botón Flotante de WhatsApp */}
      <a
        href={`https://wa.me/${restaurant.phone_number}text=${encodeURIComponent(
          `¡Hola! Estoy viendo el menú de ${restaurant.name} y me gustaría hacer un pedido.`
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 z-50 flex items-center justify-center"
        style={{ backgroundColor: '#25D366' }}
      >
        <svg 
          viewBox="0 0 24 24" 
          className="w-8 h-8 fill-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.411-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

      <main className="min-h-screen bg-gray-50 p-4">
        <header className="mb-8 text-center max-w-4xl mx-auto">
          {restaurant.logo_url && (
            <img
              src={restaurant.logo_url}
              alt={`${restaurant.name} logo`}
              className="mx-auto mb-4 rounded-full w-24 h-24 object-cover"
            />
          )}
          <h1 
            className="text-4xl font-bold mb-2" 
            style={{ color: restaurant.primary_color }}
          >
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="text-gray-600">{restaurant.description}</p>
          )}
        </header>

        <div className="max-w-4xl mx-auto space-y-8 pb-24">
          {restaurant.categories
            ?.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
            .map((category: any) => (
              <section key={category.id} className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-semibold mb-6 border-b pb-3 text-gray-800">
                  {category.name}
                </h2>
                <div className="space-y-4">
                  {category.products
                    ?.filter((product: any) => product.is_available !== false)
                    .map((product: any) => (
                      <div
                        key={product.id}
                        className="flex gap-4 items-start hover:bg-gray-50 p-4 rounded-xl transition-colors"
                      >
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
    </>
  );
}
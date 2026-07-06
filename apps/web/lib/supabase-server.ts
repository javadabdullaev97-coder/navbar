// Серверный Supabase-клиент на cookie-сессиях (@supabase/ssr).
// Для аутентифицированных запросов из server-компонентов и route handlers.
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list: CookieToSet[]) => {
          try {
            for (const { name, value, options } of list) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // set из server-компонента может бросать — игнорируем (обновит middleware/route)
          }
        },
      },
    },
  );
}

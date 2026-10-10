import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/*
 * Renova a sessão do painel a cada visita, para o login não expirar no meio do uso,
 * e manda quem não está logado para o login. A lista de e-mails é conferida na página.
 */
export async function middleware(req: NextRequest) {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  let res = NextResponse.next({ request: req });
  if (!url || !chave) return res;

  const supabase = createServerClient(url, chave, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (lista) => {
        lista.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        lista.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  // sem sessão, nem começa a desenhar o painel: vai direto para o login
  if (!data.user && req.nextUrl.pathname !== "/painel/entrar") {
    const entrar = req.nextUrl.clone();
    entrar.pathname = "/painel/entrar";
    entrar.search = "";
    return NextResponse.redirect(entrar);
  }
  return res;
}

export const config = { matcher: ["/painel/:path*"] };

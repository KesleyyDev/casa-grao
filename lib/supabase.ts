import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/*
 * Tudo do Supabase roda no servidor: a chave secreta nunca vai pro navegador.
 * O login usa a mesma chave; no navegador só ficam os cookies da sessão.
 */

export function configSupabase() {
  // aceita a URL do projeto com ou sem o "/rest/v1" que o painel do Supabase às vezes mostra
  const url = process.env.SUPABASE_URL?.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  return url && chave ? { url, chave } : null;
}

/* Quem pode entrar no painel: PAINEL_EMAILS, separados por vírgula. */
export function emailAutorizado(email: string | null | undefined) {
  const lista = (process.env.PAINEL_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(email) && lista.includes(email!.toLowerCase());
}

/* Cliente de sessão: lê e grava os cookies do login. */
export async function supabaseSessao() {
  const config = configSupabase();
  if (!config) return null;
  const loja = await cookies();
  return createServerClient(config.url, config.chave, {
    cookies: {
      getAll: () => loja.getAll(),
      setAll: (lista) => {
        try {
          lista.forEach(({ name, value, options }) => loja.set(name, value, options));
        } catch {
          // chamado de um Server Component: o middleware renova a sessão
        }
      },
    },
  });
}

/* Cliente de leitura das visitas, sem sessão. */
export function supabaseDados() {
  const config = configSupabase();
  if (!config) return null;
  return createClient(config.url, config.chave, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/* Estado do acesso: sem sessão, logado mas fora da lista, ou liberado. */
export async function acessoAoPainel() {
  const supabase = await supabaseSessao();
  if (!supabase) return { estado: "fora" as const };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { estado: "fora" as const };
  if (!emailAutorizado(data.user.email)) return { estado: "negado" as const };
  return { estado: "liberado" as const, usuario: data.user };
}

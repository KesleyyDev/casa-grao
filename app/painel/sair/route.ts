import { NextResponse, type NextRequest } from "next/server";
import { supabaseSessao } from "@/lib/supabase";

/* Encerra a sessão de quem entrou com um e-mail fora da lista e volta ao login com o aviso. */
export async function GET(req: NextRequest) {
  const supabase = await supabaseSessao();
  await supabase?.auth.signOut();
  const destino = new URL("/painel/entrar", req.url);
  if (req.nextUrl.searchParams.get("motivo") === "negado") destino.searchParams.set("motivo", "negado");
  return NextResponse.redirect(destino);
}

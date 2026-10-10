import { canalDe } from "@/lib/origem";
import { configSupabase } from "@/lib/supabase";

/*
 * Recebe a visita da vitrine e grava na tabela `visitas` do Supabase.
 * Sem SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY, a visita é validada e descartada.
 */

type Corpo = {
  canal?: string;
  meio?: string | null;
  campanha?: string | null;
  referrer?: string | null;
  pagina?: string;
};

const limpa = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim().slice(0, 120) : null);

export async function POST(req: Request) {
  let corpo: Corpo;
  try {
    corpo = (await req.json()) as Corpo;
  } catch {
    return new Response(null, { status: 400 });
  }

  const visita = {
    canal: canalDe(limpa(corpo.canal)),
    meio: limpa(corpo.meio),
    campanha: limpa(corpo.campanha),
    referrer: limpa(corpo.referrer),
    pagina: limpa(corpo.pagina) ?? "/",
  };

  const config = configSupabase();
  if (!config) {
    return new Response(null, { status: 204 });
  }

  const { url, chave } = config;
  const r = await fetch(`${url}/rest/v1/visitas`, {
    method: "POST",
    headers: {
      apikey: chave,
      authorization: `Bearer ${chave}`,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify(visita),
  });
  return new Response(null, { status: r.ok ? 204 : 502 });
}

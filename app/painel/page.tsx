import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PERIODOS, intervalos, periodoDe, resumir, type Intervalo, type Visita } from "@/lib/painel";
import { acessoAoPainel, supabaseDados } from "@/lib/supabase";
import { sair } from "./acoes";
import { Conteudo } from "./conteudo";
import { Faixa } from "./faixa";
import styles from "./painel.module.css";

export const dynamic = "force-dynamic";

const PAGINA = 1000;

/* Lê as visitas do intervalo em páginas de 1000 (o limite de linhas por pedido do Supabase). */
async function lerVisitas(inicio: string, fim: string): Promise<Visita[] | null> {
  const supabase = supabaseDados();
  if (!supabase) return null;
  const todas: Visita[] = [];
  for (let de = 0; ; de += PAGINA) {
    const { data, error } = await supabase
      .from("visitas")
      .select("canal,meio,campanha,criado_em")
      .gte("criado_em", inicio)
      .lt("criado_em", fim)
      .order("id")
      .range(de, de + PAGINA - 1);
    if (error) return null;
    todas.push(...(data as Visita[]));
    if (data.length < PAGINA) return todas;
  }
}

const dentro = (v: Visita, i: Intervalo) => {
  const t = Date.parse(v.criado_em);
  return t >= Date.parse(i.inicio) && t < Date.parse(i.fim);
};

/* ----------------------------------------------------------------- tela */

export default async function Painel({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const acesso = await acessoAoPainel();
  // logado com um e-mail fora da lista: encerra a sessão e explica no login
  if (acesso.estado === "negado") redirect("/painel/sair?motivo=negado");
  if (acesso.estado !== "liberado") redirect("/painel/entrar");

  const periodo = periodoDe((await searchParams).periodo);
  const { atual, anterior } = intervalos(periodo);
  const lidas = await lerVisitas(anterior.inicio, atual.fim);
  const h = await headers();
  const base = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;

  return (
    <>
      <Faixa periodo={periodo} periodos={PERIODOS} acaoSair={sair} />
      <main className={styles.tela}>
        {lidas === null ? (
          <section className={styles.resposta}>
            <h1 className={styles.frase}>Não deu para ler as visitas agora.</h1>
            <p className={styles.sub}>
              O banco não respondeu. Recarregue a página em alguns instantes; se continuar, confira as variáveis do
              Supabase no servidor.
            </p>
          </section>
        ) : (
          <Conteudo
            resumo={resumir(
              lidas.filter((v) => dentro(v, atual)),
              lidas.filter((v) => dentro(v, anterior)),
              atual,
            )}
            periodo={periodo}
            atual={atual}
            base={base}
          />
        )}
      </main>
    </>
  );
}

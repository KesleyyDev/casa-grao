import { redirect } from "next/navigation";
import { acessoAoPainel } from "@/lib/supabase";
import { Faixa } from "../faixa";
import styles from "../painel.module.css";
import { FormEntrar } from "./form-entrar";

export const dynamic = "force-dynamic";

export default async function Entrar({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  if ((await acessoAoPainel()).estado === "liberado") redirect("/painel");
  const negado = (await searchParams).motivo === "negado";
  return (
    <>
      <Faixa />
      <main className={styles.entrar}>
        <h1 className={styles.frase}>De onde vêm as visitas da vitrine.</h1>
        <p className={styles.sub}>Entre com o e-mail e a senha que o administrador do site criou para você.</p>
        {negado && (
          <p className={styles.aviso} role="alert">
            Este e-mail não está liberado para o painel. Fale com quem administra o site.
          </p>
        )}
        <FormEntrar />
      </main>
    </>
  );
}

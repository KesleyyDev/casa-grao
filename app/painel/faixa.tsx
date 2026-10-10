import Link from "next/link";
import styles from "./painel.module.css";

/* A faixa de café do topo: marca, períodos e saída. */
export function Faixa<P extends string>({
  periodo,
  periodos,
  acaoSair,
}: {
  periodo?: P;
  periodos?: Record<P, string>;
  acaoSair?: () => Promise<void>;
}) {
  return (
    <header className={styles.faixa}>
      <Link href="/painel" className={styles.marca}>
        Casa Grão <span>Origem das visitas</span>
      </Link>
      {periodos && (
        <nav className={styles.periodos} aria-label="Período">
          {(Object.keys(periodos) as P[]).map((p) => (
            <Link
              key={p}
              href={p === "7d" ? "/painel" : `/painel?periodo=${p}`}
              aria-current={p === periodo ? "page" : undefined}
              scroll={false}
            >
              {periodos[p]}
            </Link>
          ))}
        </nav>
      )}
      {acaoSair && (
        <form action={acaoSair} className={styles.sair}>
          <button type="submit">Sair</button>
        </form>
      )}
    </header>
  );
}

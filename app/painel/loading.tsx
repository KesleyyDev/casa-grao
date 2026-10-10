import { PERIODOS } from "@/lib/painel";
import { sair } from "./acoes";
import { Faixa } from "./faixa";
import styles from "./painel.module.css";

/* Esqueleto enquanto as visitas são lidas: a mesma grade, sem números. */
export default function Carregando() {
  return (
    <>
      {/* a faixa já com períodos e Sair, para não mudar de altura quando os dados chegam */}
      <Faixa periodos={PERIODOS} acaoSair={sair} />
      <main className={styles.tela} aria-busy="true">
        <section className={styles.resposta}>
          <p className={styles.sr}>Lendo as visitas…</p>
          <div className={styles.esqueletoFrase} aria-hidden="true">
            <span />
            <span />
          </div>
          <ul className={styles.ranking} aria-hidden="true">
            {[78, 46, 32, 24, 12].map((l) => (
              <li key={l} className={`${styles.linha} ${styles.esqueleto}`}>
                <span />
                <span className={styles.nome} />
                <span className={styles.trilho}>
                  <span style={{ width: `${l}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

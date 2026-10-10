import type { Canal } from "@/lib/origem";
import {
  diaCurto,
  diaDaSemana,
  diaDaSemanaInteiro,
  diferenca,
  textoDia,
  textoIntervalo,
  visitas,
  type Intervalo,
  type Linha,
  type LinhaCanal,
  type Periodo,
  type Resumo,
} from "@/lib/painel";
import { BotaoCopiar } from "./botao-copiar";
import styles from "./painel.module.css";

/* ------------------------------------------------------------- a frase */

const ABERTURA: Record<Periodo, string> = {
  "7d": "Nos últimos 7 dias",
  "30d": "Nos últimos 30 dias",
  mes: "Neste mês",
};

const REFERENCIA: Record<Periodo, string> = {
  "7d": "na semana anterior",
  "30d": "nos 30 dias anteriores",
  mes: "no mesmo período do mês passado",
};

/* sujeito da frase, com artigo */
const SUJEITO: Record<Canal, string> = {
  instagram: "O Instagram",
  whatsapp: "O WhatsApp",
  "google-ads": "O Google Ads",
  "meta-ads": "O Meta Ads",
  "google-meu-negocio": "O Google Meu Negócio",
  direto: "",
  outros: "",
};

function destaque(canais: LinhaCanal[]) {
  const [primeiro, segundo] = canais;
  if (!primeiro || primeiro.visitas === 0) return null;
  const n = <em>{primeiro.visitas}</em>;
  if (segundo && segundo.visitas === primeiro.visitas) {
    return (
      <>
        {primeiro.nome} e {segundo.nome} empataram, com {n} cada.
      </>
    );
  }
  if (primeiro.canal === "direto") {
    return <>{n} chegaram direto, sem chave de origem.</>;
  }
  if (primeiro.canal === "outros") {
    return <>Outros sites trouxeram {n}.</>;
  }
  return (
    <>
      {SUJEITO[primeiro.canal]} trouxe {n}.
    </>
  );
}

function comparacao(r: Resumo, periodo: Periodo) {
  const ref = REFERENCIA[periodo];
  if (r.totalAnterior === 0) return r.total > 0 ? `nenhuma ${ref}` : null;
  const d = r.total - r.totalAnterior;
  if (d === 0) return `o mesmo número ${ref} (${r.totalAnterior})`;
  return `${Math.abs(d)} a ${d > 0 ? "mais" : "menos"} que ${ref} (${r.totalAnterior})`;
}

/* ------------------------------------------------------------ o ranking */

const SEM_VISITA: Record<Canal, string> = {
  instagram: "Nenhum link com a chave instagram trouxe visita.",
  whatsapp: "Nenhum link com a chave whatsapp trouxe visita.",
  "google-ads": "Nenhum anúncio com a chave google-ads trouxe visita.",
  "meta-ads": "Nenhum anúncio com a chave meta-ads trouxe visita.",
  "google-meu-negocio": "Nenhum link com a chave google-meu-negocio trouxe visita.",
  direto: "Ninguém chegou sem chave de origem.",
  outros: "Nenhum outro site trouxe visita.",
};

function Diferenca({ linha }: { linha: Linha }) {
  const { texto, tom } = diferenca(linha);
  return (
    <span className={styles.diferenca} data-tom={tom}>
      <span className={styles.sr}>Diferença para o período anterior: </span>
      {texto}
    </span>
  );
}

function Barra({ valor, maximo, fina }: { valor: number; maximo: number; fina?: boolean }) {
  const largura = maximo > 0 ? (valor / maximo) * 100 : 0;
  return (
    <span className={styles.trilho} aria-hidden="true">
      {largura > 0 && <span className={fina ? `${styles.barra} ${styles.fina}` : styles.barra} style={{ width: `${largura}%` }} />}
    </span>
  );
}

function Seta() {
  return (
    <svg className={styles.seta} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Ranking({ canais }: { canais: LinhaCanal[] }) {
  const maximo = Math.max(1, ...canais.flatMap((c) => [c.visitas, ...c.campanhas.map((x) => x.visitas)]));
  const comMovimento = canais.filter((c) => c.visitas > 0 || c.anteriores > 0);
  const parados = canais.filter((c) => c.visitas === 0 && c.anteriores === 0);
  const aberto = comMovimento.find((c) => c.visitas > 0)?.canal;

  return (
    <ul className={styles.ranking} aria-label="Visitas por canal">
      {comMovimento.map((c) => (
        <li key={c.canal}>
        <details className={styles.canal} open={c.canal === aberto}>
          <summary className={styles.linha}>
            <Seta />
            <span className={styles.nome}>{c.nome}</span>
            <Barra valor={c.visitas} maximo={maximo} />
            <span className={styles.numero}>
              {c.visitas}
              <span className={styles.sr}> {c.visitas === 1 ? "visita" : "visitas"}</span>
            </span>
            <Diferenca linha={c} />
          </summary>
          <ul className={styles.campanhas} aria-label={`Campanhas de ${c.nome}`}>
            {c.campanhas.map((x) => (
              <li key={x.chave} className={styles.linha}>
                <span className={styles.nome}>{x.nome}</span>
                <Barra valor={x.visitas} maximo={maximo} fina />
                <span className={styles.numero}>{x.visitas}</span>
                <Diferenca linha={x} />
              </li>
            ))}
          </ul>
        </details>
        </li>
      ))}
      {parados.map((c) => (
        <li key={c.canal} className={`${styles.linha} ${styles.parado}`}>
          <span className={styles.nome}>{c.nome}</span>
          <span className={styles.dica}>{SEM_VISITA[c.canal]}</span>
          <span className={styles.numero}>0</span>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ dia a dia */

/* em períodos longos, uma legenda por semana e o último dia, sem encostar na anterior */
function mostraLegenda(i: number, total: number) {
  if (total <= 7) return true;
  const ultimo = total - 1;
  if (i === ultimo) return true;
  return i % 7 === 0 && ultimo - i >= 4;
}

function DiaADia({ resumo, periodo }: { resumo: Resumo; periodo: Periodo }) {
  const maximo = Math.max(1, ...resumo.porDia.map((d) => d.visitas));
  const longo = resumo.porDia.length > 7;
  const melhor = resumo.porDia.reduce((a, b) => (b.visitas > a.visitas ? b : a), resumo.porDia[0]);

  return (
    <section className={styles.dias} aria-labelledby="titulo-dias">
      <h2 id="titulo-dias" className={styles.rotulo}>
        Dia a dia
      </h2>
      <ol className={styles.colunas} data-longo={longo || undefined}>
        {resumo.porDia.map((d, i) => (
          <li key={d.dia}>
            <span className={styles.coluna} style={{ height: `${(d.visitas / maximo) * 100}%` }} aria-hidden="true" />
            <span className={styles.sr}>
              {textoDia(d.dia)}: {visitas(d.visitas)}
            </span>
            <span className={styles.legendaDia} aria-hidden="true" data-mostra={mostraLegenda(i, resumo.porDia.length) || undefined}>
              {longo ? diaCurto(d.dia) : diaDaSemana(d.dia)}
            </span>
          </li>
        ))}
      </ol>
      {melhor.visitas > 0 && (
        <p className={styles.nota}>
          <strong>
            {periodo === "7d" ? `${diaDaSemanaInteiro(melhor.dia)}, ${textoDia(melhor.dia)},` : textoDia(melhor.dia)}
          </strong>{" "}
          foi o dia com mais visitas: {melhor.visitas}.
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------- como montar os links */

/* quebra o link só antes de ? e &, nunca no meio de uma chave */
function LinkComChave({ url }: { url: string }) {
  const partes = url.split(/(?=[?&])/);
  return (
    <code>
      {partes.map((p, i) => (
        <span key={i}>
          {i > 0 && <wbr />}
          {p}
        </span>
      ))}
    </code>
  );
}

function ComoMontar({ base, aberto, principal }: { base: string; aberto: boolean; principal?: boolean }) {
  const exemplos: [string, string][] = [
    ["Bio do Instagram", "?utm_source=instagram&utm_medium=bio"],
    ["Post ou stories", "?utm_source=instagram&utm_medium=post&utm_campaign=nome-do-post"],
    ["WhatsApp", "?utm_source=whatsapp"],
    ["Google Meu Negócio", "?utm_source=google-meu-negocio"],
    ["Anúncio no Google", "?utm_source=google-ads&utm_campaign=nome-da-campanha"],
    ["Anúncio no Instagram e Facebook", "?utm_source=meta-ads&utm_campaign=nome-da-campanha"],
  ];
  return (
    <details className={principal ? `${styles.comoMontar} ${styles.principal}` : styles.comoMontar} open={aberto}>
      <summary>
        <Seta />
        Como montar um link com chave
      </summary>
      <p>
        Cada link divulgado leva a chave do canal no fim. A campanha é o nome que vai aparecer aberto dentro do
        canal.
      </p>
      <dl>
        {exemplos.map(([onde, chave]) => (
          <div key={onde}>
            <dt>{onde}</dt>
            <dd>
              <LinkComChave url={`${base}/${chave}`} />
            </dd>
            <BotaoCopiar texto={`${base}/${chave}`} rotulo={onde} />
          </div>
        ))}
      </dl>
    </details>
  );
}

/* ----------------------------------------------------------------- tela */

export function Conteudo({ resumo, periodo, atual, base }: { resumo: Resumo; periodo: Periodo; atual: Intervalo; base: string }) {
  const vazio = resumo.total === 0;
  const comp = comparacao(resumo, periodo);
  return (
    <>
      <section className={vazio ? `${styles.resposta} ${styles.inteira}` : styles.resposta} aria-labelledby="frase">
        <h1 id="frase" className={styles.frase}>
          {vazio ? (
            <>{ABERTURA[periodo]}, a vitrine ainda não teve visitas.</>
          ) : (
            <>
              {ABERTURA[periodo]}, a vitrine teve <em>{visitas(resumo.total)}</em>. {destaque(resumo.canais)}
            </>
          )}
        </h1>
        <p className={styles.sub}>
          {textoIntervalo(atual)}
          {comp && <> · {comp}</>}
        </p>
        {vazio ? (
          // sem visitas, o que ajuda é saber montar o link: ocupa o lugar do ranking
          <ComoMontar base={base} aberto principal />
        ) : (
          <Ranking canais={resumo.canais} />
        )}
      </section>
      {!vazio && (
        <aside className={styles.lateral}>
          <DiaADia resumo={resumo} periodo={periodo} />
          <ComoMontar base={base} aberto={false} />
        </aside>
      )}
    </>
  );
}

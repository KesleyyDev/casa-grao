import { CANAIS, type Canal } from "@/lib/origem";

/*
 * Períodos e contas do painel. Datas no fuso de Curitiba (UTC−3; o Brasil
 * não tem horário de verão desde 2019, então o deslocamento é fixo).
 */

export const PERIODOS = { "7d": "7 dias", "30d": "30 dias", mes: "Este mês" } as const;
export type Periodo = keyof typeof PERIODOS;

export const NOME_CANAL: Record<Canal, string> = {
  instagram: "Instagram",
  whatsapp: "WhatsApp",
  "google-ads": "Google Ads",
  "meta-ads": "Meta Ads",
  "google-meu-negocio": "Google Meu Negócio",
  direto: "Direto",
  outros: "Outros sites",
};

const FUSO = "-03:00";
const DIA_MS = 86_400_000;

export type Visita = { canal: string; meio: string | null; campanha: string | null; criado_em: string };

export type Intervalo = { inicio: string; fim: string; dias: string[] };

/* "2026-10-09" no fuso da casa */
export function diaLocal(data: Date): string {
  return new Date(data.getTime() - 3 * 3_600_000).toISOString().slice(0, 10);
}

function somaDias(dia: string, n: number): string {
  return new Date(Date.parse(`${dia}T00:00:00Z`) + n * DIA_MS).toISOString().slice(0, 10);
}

function intervalo(primeiro: string, ultimo: string): Intervalo {
  const dias: string[] = [];
  for (let d = primeiro; d <= ultimo; d = somaDias(d, 1)) dias.push(d);
  return { inicio: `${primeiro}T00:00:00${FUSO}`, fim: `${somaDias(ultimo, 1)}T00:00:00${FUSO}`, dias };
}

export function periodoDe(valor: string | string[] | undefined): Periodo {
  return typeof valor === "string" && valor in PERIODOS ? (valor as Periodo) : "7d";
}

/* O período pedido e o período com que ele é comparado. */
export function intervalos(periodo: Periodo, agora = new Date()): { atual: Intervalo; anterior: Intervalo } {
  const hoje = diaLocal(agora);
  if (periodo === "mes") {
    const primeiro = `${hoje.slice(0, 8)}01`;
    const n = Number(hoje.slice(8, 10));
    // mesmos dias do mês anterior, sem passar do último dia dele
    const primeiroAnt = somaDias(primeiro, -1).slice(0, 8) + "01";
    const ultimoDoAnt = somaDias(primeiro, -1);
    const ultimoAnt = somaDias(primeiroAnt, n - 1) < ultimoDoAnt ? somaDias(primeiroAnt, n - 1) : ultimoDoAnt;
    return { atual: intervalo(primeiro, hoje), anterior: intervalo(primeiroAnt, ultimoAnt) };
  }
  const n = periodo === "7d" ? 7 : 30;
  return {
    atual: intervalo(somaDias(hoje, -(n - 1)), hoje),
    anterior: intervalo(somaDias(hoje, -(2 * n - 1)), somaDias(hoje, -n)),
  };
}

export type Linha = { chave: string; nome: string; visitas: number; anteriores: number };
export type LinhaCanal = Linha & { canal: Canal; campanhas: Linha[] };

export type Resumo = {
  total: number;
  totalAnterior: number;
  canais: LinhaCanal[];
  porDia: { dia: string; visitas: number }[];
};

/* Nome da campanha: utm_campaign; sem ela, o utm_medium; sem os dois, "sem campanha". */
function campanhaDe(v: Visita): string {
  return v.campanha || v.meio || "sem campanha";
}

export function resumir(atuais: Visita[], anteriores: Visita[], atual: Intervalo): Resumo {
  const canais = new Map<Canal, LinhaCanal>(
    CANAIS.map((canal) => [canal, { chave: canal, canal, nome: NOME_CANAL[canal], visitas: 0, anteriores: 0, campanhas: [] }]),
  );
  const campanhas = new Map<string, Linha>();

  const conta = (v: Visita, campo: "visitas" | "anteriores") => {
    const canal = canais.get(v.canal as Canal) ?? canais.get("outros")!;
    canal[campo] += 1;
    const nome = campanhaDe(v);
    const chave = `${canal.canal}|${nome}`;
    let linha = campanhas.get(chave);
    if (!linha) {
      linha = { chave, nome, visitas: 0, anteriores: 0 };
      campanhas.set(chave, linha);
      canal.campanhas.push(linha);
    }
    linha[campo] += 1;
  };
  atuais.forEach((v) => conta(v, "visitas"));
  anteriores.forEach((v) => conta(v, "anteriores"));

  const ordem = (a: Linha, b: Linha) => b.visitas - a.visitas || b.anteriores - a.anteriores || a.nome.localeCompare(b.nome);
  const lista = [...canais.values()];
  lista.forEach((c) => {
    // campanha que só existiu no período anterior também aparece: mostra a queda
    c.campanhas.sort(ordem);
  });
  lista.sort(ordem);

  const dias = new Map(atual.dias.map((d) => [d, 0]));
  atuais.forEach((v) => {
    const d = diaLocal(new Date(v.criado_em));
    if (dias.has(d)) dias.set(d, dias.get(d)! + 1);
  });

  return {
    total: atuais.length,
    totalAnterior: anteriores.length,
    canais: lista,
    porDia: [...dias].map(([dia, visitas]) => ({ dia, visitas })),
  };
}

/* ---------------------------------------------------------------- textos */

const MESES = ["jan.", "fev.", "mar.", "abr.", "maio", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const partes = (dia: string) => ({ d: Number(dia.slice(8, 10)), m: Number(dia.slice(5, 7)) - 1 });

export function diaDaSemana(dia: string): string {
  return SEMANA[new Date(`${dia}T12:00:00Z`).getUTCDay()];
}

const SEMANA_INTEIRA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function diaDaSemanaInteiro(dia: string): string {
  return SEMANA_INTEIRA[new Date(`${dia}T12:00:00Z`).getUTCDay()];
}

export function diaCurto(dia: string): string {
  return String(partes(dia).d);
}

/* "3 a 9 de out." · "28 de set. a 4 de out." */
export function textoIntervalo({ dias }: Intervalo): string {
  const a = partes(dias[0]);
  const b = partes(dias[dias.length - 1]);
  if (dias.length === 1) return `${b.d} de ${MESES[b.m]}`;
  return a.m === b.m ? `${a.d} a ${b.d} de ${MESES[b.m]}` : `${a.d} de ${MESES[a.m]} a ${b.d} de ${MESES[b.m]}`;
}

export function textoDia(dia: string): string {
  const { d, m } = partes(dia);
  return `${d} de ${MESES[m]}`;
}

export const visitas = (n: number) => (n === 1 ? "1 visita" : `${n} visitas`);

/* Diferença contra o período anterior, como aparece na coluna. */
export function diferenca(l: Linha): { texto: string; tom: "sobe" | "desce" | "igual" } {
  if (l.anteriores === 0 && l.visitas > 0) return { texto: "novo", tom: "sobe" };
  const d = l.visitas - l.anteriores;
  if (d > 0) return { texto: `+${d}`, tom: "sobe" };
  if (d < 0) return { texto: `−${-d}`, tom: "desce" };
  return { texto: "igual", tom: "igual" };
}

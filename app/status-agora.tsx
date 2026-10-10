"use client";

import { useEffect, useState } from "react";

const ABRE = 8;
const FECHA = 19;
const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

type Estado = { aberto: boolean; texto: string };

function horaEmCuritiba(agora: Date) {
  const partes = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  }).formatToParts(agora);
  const pega = (t: string) => partes.find((p) => p.type === t)?.value ?? "";
  const mapa: Record<string, number> = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sáb: 6 };
  const dia = mapa[pega("weekday").replace(".", "").toLowerCase()] ?? agora.getDay();
  return { dia, hora: Number(pega("hour")) + Number(pega("minute")) / 60 };
}

export function calculaEstado(agora: Date): Estado {
  const { dia, hora } = horaEmCuritiba(agora);
  const diaUtil = dia >= 1 && dia <= 6;
  if (diaUtil && hora >= ABRE && hora < FECHA) {
    return { aberto: true, texto: "Aberto agora" };
  }
  if (diaUtil && hora < ABRE) {
    return { aberto: false, texto: "Abre hoje às 8h" };
  }
  // depois das 19h ou domingo: próximo dia útil
  let proximo = (dia + 1) % 7;
  if (proximo === 0) proximo = 1;
  const quando = proximo === (dia + 1) % 7 ? "amanhã" : DIAS[proximo];
  return { aberto: false, texto: `Abre ${quando} às 8h` };
}

export function StatusAgora({ className, abertoClassName }: { className?: string; abertoClassName?: string }) {
  const [estado, setEstado] = useState<Estado | null>(null);

  useEffect(() => {
    const atualiza = () => setEstado(calculaEstado(new Date()));
    atualiza();
    const id = window.setInterval(atualiza, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!estado) return null;
  return (
    <span className={`${className ?? ""} ${estado.aberto ? abertoClassName ?? "" : ""}`} role="status">
      {estado.texto}
    </span>
  );
}

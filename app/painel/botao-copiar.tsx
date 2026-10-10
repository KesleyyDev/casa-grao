"use client";

import { useState } from "react";
import styles from "./painel.module.css";

/* Copia o link pronto: no celular é mais fácil que selecionar o texto. */
export function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [copiado, setCopiado] = useState(false);
  const copia = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // sem permissão de área de transferência: o texto continua selecionável
    }
  };
  return (
    <button
      type="button"
      className={styles.copiar}
      data-copiar=""
      data-copiado={copiado || undefined}
      onClick={copia}
      aria-label={`Copiar link: ${rotulo}`}
    >
      <span aria-live="polite">{copiado ? "Copiado" : "Copiar"}</span>
    </button>
  );
}

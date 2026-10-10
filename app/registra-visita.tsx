"use client";

import { useEffect } from "react";
import { lerOrigem } from "@/lib/origem";

/* Registra uma visita por sessão, com a chave de origem, para o painel. */
export function RegistraVisita() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("casa-grao:visita")) return;
      sessionStorage.setItem("casa-grao:visita", "1");
    } catch {
      // sem sessionStorage: registra mesmo assim
    }
    const origem = lerOrigem(new URL(window.location.href), document.referrer);
    const corpo = JSON.stringify({ ...origem, pagina: window.location.pathname });
    const enviado = navigator.sendBeacon?.("/api/visita", new Blob([corpo], { type: "application/json" }));
    if (!enviado) {
      fetch("/api/visita", { method: "POST", body: corpo, headers: { "content-type": "application/json" }, keepalive: true }).catch(
        () => {},
      );
    }
  }, []);

  return null;
}

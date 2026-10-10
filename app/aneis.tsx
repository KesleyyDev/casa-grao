"use client";

import { useEffect } from "react";

/* Cada marca de xícara aparece quando a seção entra na tela e fica: o pano acumula. */
export function Aneis() {
  useEffect(() => {
    const aneis = document.querySelectorAll<HTMLElement>("[data-anel]");
    if (!("IntersectionObserver" in window)) {
      aneis.forEach((a) => (a.dataset.anel = "marcado"));
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.anel = "marcado";
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.15 },
    );
    aneis.forEach((a) => obs.observe(a));
    return () => obs.disconnect();
  }, []);

  return null;
}

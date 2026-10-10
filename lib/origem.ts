/*
 * Chave de origem da visita (PRODUCT.md → Capabilities and Constraints).
 * UTM padrão; sem UTM, gclid → google-ads, fbclid → meta-ads, depois referrer, senão direto.
 */

export const CANAIS = [
  "instagram",
  "whatsapp",
  "google-ads",
  "meta-ads",
  "google-meu-negocio",
  "direto",
  "outros",
] as const;

export type Canal = (typeof CANAIS)[number];

export type Origem = {
  canal: Canal;
  meio: string | null;
  campanha: string | null;
  referrer: string | null;
};

function normaliza(valor: string | null): string | null {
  const v = valor?.trim().toLowerCase();
  return v ? v.slice(0, 80) : null;
}

export function canalDe(fonte: string | null): Canal {
  if (!fonte) return "direto";
  return (CANAIS as readonly string[]).includes(fonte) ? (fonte as Canal) : "outros";
}

export function lerOrigem(url: URL, referrer: string): Origem {
  const p = url.searchParams;
  const fonte = normaliza(p.get("utm_source"));
  const meio = normaliza(p.get("utm_medium"));
  const campanha = normaliza(p.get("utm_campaign"));
  const ref = referrer ? safeHost(referrer) : null;

  if (fonte) return { canal: canalDe(fonte), meio, campanha, referrer: ref };
  if (p.has("gclid")) return { canal: "google-ads", meio: "cpc", campanha, referrer: ref };
  if (p.has("fbclid")) return { canal: "meta-ads", meio: null, campanha, referrer: ref };

  if (ref && ref !== url.hostname) {
    if (/(^|\.)instagram\.com$/.test(ref) || ref === "l.instagram.com") {
      return { canal: "instagram", meio: null, campanha: null, referrer: ref };
    }
    if (/(^|\.)whatsapp\.com$/.test(ref) || ref === "wa.me") {
      return { canal: "whatsapp", meio: null, campanha: null, referrer: ref };
    }
    return { canal: "outros", meio: null, campanha: null, referrer: ref };
  }
  return { canal: "direto", meio: null, campanha: null, referrer: null };
}

function safeHost(referrer: string): string | null {
  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

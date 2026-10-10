import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casa Grão — Cafeteria artesanal em Curitiba",
  description:
    "Cafés especiais de produtores brasileiros e receitas feitas na casa. Seg a sáb, 8h às 19h, no Água Verde.",
};

const PRE_PINTURA = `(function(){var r=document.documentElement;r.dataset.js="1";try{if(!matchMedia("(prefers-reduced-motion: reduce)").matches)r.dataset.mancha="seco";}catch(e){}})();`;

export const viewport: Viewport = {
  themeColor: "#412413",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* antes do primeiro quadro: decide se o café cai (animação) ou se a página já abre molhada */}
        <script dangerouslySetInnerHTML={{ __html: PRE_PINTURA }} />
        {/* sem JS a revelação ao rolar nunca dispara: os blocos aparecem prontos */}
        <noscript>
          <style>{"[data-revela]{opacity:1!important;transform:none!important;filter:none!important}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}

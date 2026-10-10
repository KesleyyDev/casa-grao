import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Painel · Casa Grão",
  robots: { index: false, follow: false },
};

export default function LayoutPainel({ children }: { children: React.ReactNode }) {
  return children;
}

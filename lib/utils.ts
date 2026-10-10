/* junta classes ignorando as vazias (o site usa CSS modules, sem Tailwind) */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

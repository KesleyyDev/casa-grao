"use server";

import { redirect } from "next/navigation";
import { emailAutorizado, supabaseSessao } from "@/lib/supabase";

export type EstadoEntrar = { erro: string | null; email: string };

export async function entrar(_: EstadoEntrar, form: FormData): Promise<EstadoEntrar> {
  const email = String(form.get("email") ?? "").trim();
  const senha = String(form.get("senha") ?? "");
  if (!email || !senha) return { erro: "Preencha o e-mail e a senha.", email };

  const supabase = await supabaseSessao();
  if (!supabase) return { erro: "O banco do painel ainda não está configurado neste servidor.", email };

  if (!process.env.PAINEL_EMAILS?.trim()) {
    return { erro: "Nenhum e-mail foi liberado para o painel ainda (PAINEL_EMAILS).", email };
  }

  // e-mail fora da lista recebe a mesma resposta de senha errada: a lista não vaza
  const { error } = emailAutorizado(email)
    ? await supabase.auth.signInWithPassword({ email, password: senha })
    : { error: { status: 400 } };
  if (error) {
    const limite = error.status === 429;
    return {
      erro: limite
        ? "Muitas tentativas seguidas. Espere alguns minutos e tente de novo."
        : "E-mail ou senha não conferem. Confira e tente de novo.",
      email,
    };
  }
  redirect("/painel");
}

export async function sair() {
  const supabase = await supabaseSessao();
  await supabase?.auth.signOut();
  redirect("/painel/entrar");
}

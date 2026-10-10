"use client";

import { useActionState } from "react";
import { entrar, type EstadoEntrar } from "../acoes";
import styles from "../painel.module.css";

const INICIAL: EstadoEntrar = { erro: null, email: "" };

export function FormEntrar() {
  const [estado, acao, enviando] = useActionState(entrar, INICIAL);
  return (
    <form action={acao} className={styles.form} noValidate>
      <label>
        <span>E-mail</span>
        <input
          type="email"
          name="email"
          autoComplete="username"
          inputMode="email"
          required
          defaultValue={estado.email}
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-entrar" : undefined}
        />
      </label>
      <label>
        <span>Senha</span>
        <input
          type="password"
          name="senha"
          autoComplete="current-password"
          required
          aria-invalid={estado.erro ? true : undefined}
          aria-describedby={estado.erro ? "erro-entrar" : undefined}
        />
      </label>
      <p id="erro-entrar" className={styles.erro} role="alert">
        {estado.erro}
      </p>
      <button type="submit" className={styles.botao} disabled={enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

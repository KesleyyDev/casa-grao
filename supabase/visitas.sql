-- Tabela de visitas da vitrine (lida pelo painel de origem do tráfego).
-- Rodar uma vez no Supabase: SQL Editor → colar → Run.

create table if not exists public.visitas (
  id        bigint generated always as identity primary key,
  criado_em timestamptz not null default now(),
  canal     text not null check (canal in (
              'instagram', 'whatsapp', 'google-ads', 'meta-ads',
              'google-meu-negocio', 'direto', 'outros')),
  meio      text,
  campanha  text,
  referrer  text,
  pagina    text not null default '/'
);

create index if not exists visitas_criado_em_idx on public.visitas (criado_em desc);
create index if not exists visitas_canal_idx on public.visitas (canal, criado_em desc);

-- Sem políticas: ninguém lê nem grava pela chave pública (anon).
-- Só o servidor do site, com a service role, escreve; o painel lerá pelo servidor.
alter table public.visitas enable row level security;

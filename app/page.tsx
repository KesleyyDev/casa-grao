import Link from "next/link";
import styles from "./page.module.css";
import { Aneis } from "./aneis";
import { Mancha } from "./mancha";
import { RegistraVisita } from "./registra-visita";
import { ScrollReveal } from "./scroll-reveal";
import { StatusAgora } from "./status-agora";

/* CEP de referência informado pelo usuário (nos Correios: lado par da Av. República Argentina, 826–1764) */
const ENDERECO = {
  rua: "Rua dos Grãos, 128",
  complemento: "Loja 01",
  bairro: "Água Verde",
  cidade: "Curitiba",
  uf: "PR",
  cep: "80620-010",
};

const MAPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${ENDERECO.rua} - ${ENDERECO.bairro}, ${ENDERECO.cidade} - ${ENDERECO.uf}, ${ENDERECO.cep}`,
)}`;

type Item = { nome: string; descricao: string; preco: number };

/* Cardápio da casa (out/2026). Colunas do computador: bebidas + para levar | salgados + doces. */
const CARDAPIO: { titulo: string; itens: Item[] }[][] = [
  [
    {
      titulo: "Cafés e bebidas",
      itens: [
        { nome: "Espresso da casa", descricao: "Café especial brasileiro, encorpado e aromático.", preco: 8 },
        { nome: "Cappuccino artesanal", descricao: "Espresso, leite cremoso e um toque de canela.", preco: 14 },
        { nome: "Latte", descricao: "Espresso com leite vaporizado.", preco: 14 },
        { nome: "Mocha", descricao: "Espresso, chocolate e leite cremoso.", preco: 16 },
        { nome: "Café gelado com caramelo", descricao: "Café, leite, gelo e calda de caramelo.", preco: 17 },
        { nome: "Chocolate quente", descricao: "Chocolate cremoso preparado com leite.", preco: 15 },
        { nome: "Chá", descricao: "Camomila, hortelã ou frutas vermelhas.", preco: 9 },
      ],
    },
    {
      titulo: "Para levar",
      itens: [
        { nome: "Café em grãos — 250 g", descricao: "Café especial de produtores brasileiros.", preco: 38 },
        { nome: "Café moído — 250 g", descricao: "Nosso café especial, moído para preparo em casa.", preco: 38 },
      ],
    },
  ],
  [
    {
      titulo: "Salgados",
      itens: [
        { nome: "Pão de queijo", descricao: "Tradicional, servido quentinho.", preco: 7 },
        { nome: "Pão de queijo recheado", descricao: "Recheio de queijo cremoso.", preco: 12 },
        { nome: "Croissant na manteiga", descricao: "Massa folhada aquecida com manteiga.", preco: 12 },
        { nome: "Sanduíche da horta", descricao: "Pão artesanal, queijo, tomate e folhas frescas.", preco: 22 },
      ],
    },
    {
      titulo: "Doces da casa",
      itens: [
        { nome: "Bolo de cenoura com chocolate", descricao: "Uma fatia com cobertura de chocolate.", preco: 15 },
        { nome: "Bolo de laranja", descricao: "Uma fatia de bolo caseiro com calda de laranja.", preco: 12 },
        { nome: "Brownie", descricao: "Chocolate intenso e interior macio.", preco: 14 },
        { nome: "Cookie de chocolate", descricao: "Cookie artesanal com pedaços de chocolate.", preco: 9 },
      ],
    },
  ],
];

/* dados do lugar para buscadores (Google, mapas, IAs) */
const DADOS_ESTRUTURADOS = {
  "@context": "https://schema.org",
  "@type": "CafeOrCoffeeShop",
  name: "Casa Grão",
  slogan: "Uma pausa boa começa com um café.",
  servesCuisine: "Café especial",
  priceRange: "R$ 7–38",
  address: {
    "@type": "PostalAddress",
    streetAddress: `${ENDERECO.rua}, ${ENDERECO.complemento}`,
    addressLocality: ENDERECO.cidade,
    addressRegion: ENDERECO.uf,
    postalCode: ENDERECO.cep,
    addressCountry: "BR",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "08:00",
    closes: "19:00",
  },
  amenityFeature: { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
};

export default function Home() {
  return (
    <main>
      <section className={styles.hero} aria-labelledby="titulo">
        <picture>
          <source media="(min-width: 820px)" srcSet="/plates/stained-cloth-desktop.jpg" />
          { }
          <img
            id="pano"
            className={styles.pano}
            src="/plates/stained-cloth.jpg"
            alt=""
            width={1152}
            height={2064}
            fetchPriority="high"
          />
        </picture>
        <Mancha />
        <div className={styles.sombra} aria-hidden="true" />

        <header className={styles.topo}>
          <p className={styles.marca}>
            <span>Casa</span> <span>Grão</span>
          </p>
          <a className={styles.endereco} href="#onde">
            Endereço
          </a>
        </header>

        <h1 id="titulo" className={styles.titulo}>
          <span>O café</span> <span>acabou</span> <span>de passar.</span>
        </h1>

        <p className={styles.apoio}>
          <span>Cafés especiais de produtores brasileiros</span>{" "}
          <span>e receitas feitas na casa.</span>
        </p>

        <a className={styles.cta} href="#cardapio">
          Ver o cardápio
        </a>

        <p className={styles.itens}>
          <span>Espresso da casa · Cappuccino ·</span>{" "}
          <span>Pão de queijo · Bolo de cenoura</span>
        </p>

        <div className={styles.rodapeHero}>
          <p className={styles.horario}>
            Seg a sáb · 8h às 19h
            <span aria-hidden="true">{" · "}</span>
            <StatusAgora className={styles.status} />
          </p>
          <p className={styles.local}>
            <a href={MAPA} target="_blank" rel="noopener">
              Rua dos Grãos, 128 · Água Verde
            </a>
          </p>
        </div>
      </section>

      <section id="cardapio" className={`${styles.secao} ${styles.cardapio}`} aria-labelledby="titulo-cardapio">
        {/* a xícara ficou em cima da palavra: a marca emoldura o título */}
        <ScrollReveal className={`${styles.moldura} ${styles.molduraCardapio}`}>
          <div className={styles.anel} data-anel="seco" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/plates/anel-1.png" alt="" width={900} height={900} loading="lazy" />
          </div>
          <h2 id="titulo-cardapio" className={styles.tituloSecao}>
            Cardápio
          </h2>
        </ScrollReveal>
        <div className={styles.colunas}>
          {CARDAPIO.map((coluna, i) => (
            <div key={i} className={styles.coluna}>
              {coluna.map((grupo) => (
                <ScrollReveal
                  key={grupo.titulo}
                  className={grupo.titulo === "Para levar" ? styles.porUltimo : undefined}
                  delay={0.1 * (i + 1)}
                >
                  <h3 className={styles.grupo}>{grupo.titulo}</h3>
                  <ul className={styles.lista}>
                    {grupo.itens.map((item) => (
                      <li key={item.nome}>
                        <span className={styles.prato}>
                          <span className={styles.nomePrato}>{item.nome}</span>
                          <span className={styles.preco}>R$&nbsp;{item.preco}</span>
                        </span>
                        <span className={styles.descricao}>{item.descricao}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollReveal>
              ))}
            </div>
          ))}
        </div>
        <ScrollReveal as="p" className={styles.nota} delay={0.1}>
          Café de produtores brasileiros. Receitas feitas aqui na casa.
        </ScrollReveal>
      </section>

      <section className={`${styles.secao} ${styles.momentos}`} aria-labelledby="titulo-momentos">
        <ScrollReveal as="h2" id="titulo-momentos" className={styles.tituloSecao}>
          Do jeito que o seu dia pedir
        </ScrollReveal>
        <ol className={styles.dia}>
          <ScrollReveal as="li" delay={0.00}>
            <h3>Antes do trabalho</h3>
            <p>Um café e alguma coisa pra comer no caminho. A porta abre às 8h.</p>
          </ScrollReveal>
          <ScrollReveal as="li" delay={0.12}>
            <h3>Com calma</h3>
            <p>Puxa uma cadeira, escolhe uma fatia de bolo e deixa a correria lá fora.</p>
          </ScrollReveal>
          <ScrollReveal as="li" delay={0.24}>
            <h3>No lanche</h3>
            <p>Da manhã ou da tarde. O café acabou de passar. O bolo já está na mesa. Só falta você.</p>
          </ScrollReveal>
        </ol>
      </section>

      <section className={`${styles.secao} ${styles.wifi}`} aria-labelledby="titulo-wifi">
        <ScrollReveal as="h2" id="titulo-wifi" className={styles.frase}>
          Tem <span className={styles.junto}>Wi-Fi,</span> sim. Pode trazer o notebook e ficar.
        </ScrollReveal>
        <ScrollReveal className={`${styles.moldura} ${styles.molduraWifi}`} delay={0.15}>
          <div className={styles.anel} data-anel="seco" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/plates/anel-2.png" alt="" width={900} height={900} loading="lazy" />
          </div>
          <p className={styles.fraseApoio}>Seu café pode esperar cinco minutinhos. Você também.</p>
        </ScrollReveal>
      </section>

      <section id="onde" className={`${styles.secao} ${styles.onde}`} aria-labelledby="titulo-onde">
        <ScrollReveal as="h2" id="titulo-onde" className={styles.tituloSecao}>
          Onde fica
        </ScrollReveal>
        <ScrollReveal as="address" className={styles.enderecoCompleto} delay={0.08}>
          {/* quebra por sentido: rua, loja, bairro e cidade; o "— PR" nunca fica sozinho */}
          <span>{ENDERECO.rua}</span>
          <span>{ENDERECO.complemento}</span>
          <span>
            {ENDERECO.bairro},{" "}
            <span className={styles.junto}>
              {ENDERECO.cidade}&nbsp;—&nbsp;{ENDERECO.uf}
            </span>
          </span>
        </ScrollReveal>
        <ScrollReveal as="dl" className={styles.horas} delay={0.16}>
          <div>
            <dt>Segunda a sábado</dt>
            <dd>8h às 19h</dd>
          </div>
          <div>
            <dt>Domingo</dt>
            <dd>Fechado</dd>
          </div>
        </ScrollReveal>
        <ScrollReveal className={`${styles.moldura} ${styles.molduraOnde}`} delay={0.24}>
          <div className={styles.anel} data-anel="seco" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/plates/anel-3.png" alt="" width={900} height={900} loading="lazy" />
          </div>
          <p className={styles.agora}>
            <StatusAgora className={styles.status} />
          </p>
          <a className={styles.comoChegar} href={MAPA} target="_blank" rel="noopener">
            Como chegar
          </a>
        </ScrollReveal>
      </section>

      <footer className={styles.fim}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.fimPano} src="/plates/rodape.jpg" alt="" width={1376} height={768} loading="lazy" />
        <ScrollReveal as="p" className={styles.assinatura}>
          Uma pausa boa começa com um café.
        </ScrollReveal>
        {/* a última linha: a marca e, discreta, a entrada do painel para a equipe */}
        <ScrollReveal className={styles.linhaFim} delay={0.15}>
          <p className={styles.marcaFim}>Casa Grão · Curitiba</p>
          <Link className={styles.equipe} href="/painel" prefetch={false}>
            Área da equipe
          </Link>
        </ScrollReveal>
      </footer>

      <Aneis />
      <RegistraVisita />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DADOS_ESTRUTURADOS) }} />
    </main>
  );
}

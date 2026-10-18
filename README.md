# Atlas Migrações Leste-Sul

Plataforma de mapeamento dos artistas do Leste Europeu e da Áustria que migraram para o Brasil: contribuições da arte imigrante, 1918–1989. Projeto Migrações Leste-Sul, a partir do acervo do MAC USP. O MVP será apresentado na conferência de 10 a 12 de novembro de 2026.

Este é o **repositório principal** do ecossistema: o app web público (mapa, trajetórias, camada histórica) e a área administrativa.

## Ecossistema

| Repositório | Papel | Deploy |
|---|---|---|
| [atlas-migracoes](https://github.com/alishenriques/atlas-migracoes) | App público e área administrativa (Next.js App Router) | Vercel |
| [atlas-migracoes-api](https://github.com/alishenriques/atlas-migracoes-api) | API GraphQL, banco de dados e importação das planilhas | Vercel (serverless) |
| [atlas-migracoes-design-system](https://github.com/alishenriques/atlas-migracoes-design-system) | Biblioteca de componentes React com a identidade do Atlas | npm via GitHub Actions |

A arquitetura segue o ecossistema do [alis-portfolio](https://github.com/alishenriques/alis-portfolio). **Custo zero é requisito.**

## Rodando

Precisa do Node 22 e do Yarn 4 (`corepack enable`). A API roda ao lado, em modo demonstração se não houver banco:

```bash
# em ../atlas-migracoes-api
yarn install && yarn dev        # http://localhost:4000/graphql

# aqui
yarn install
cp .env.example .env.local
yarn dev                        # http://localhost:3000/pt
```

Com a API em modo demonstração, o app mostra um aviso de que os dados são simulados. Os dados reais entram pelo importador da API e nunca ficam neste repositório.

## Scripts

`yarn dev` · `yarn build` · `yarn lint` · `yarn typecheck` · `yarn test` · `yarn test:coverage`

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_GRAPHQL_URL` | Endpoint GraphQL da API (padrão `http://localhost:4000/graphql`) |
| `NEXT_PUBLIC_SITE_URL` | Origem pública do site, usada nos metadados (padrão `http://localhost:3000`) |

## Telas do MVP

| Rota | Tela | Estado |
|---|---|---|
| `/` | Explorar: mapa, filtros, linha do tempo e contadores | Contadores prontos; mapa na etapa 2 |
| `/trajetorias` (`/en/trajectories`) | Trajetórias: ficha e trajetória do artista | Etapa 2 |
| `/camada-historica` (`/en/historical-layer`) | Camada Histórica: mapas da Europa por década com as fronteiras da época | Etapa 3 |
| Rede Relacional (rota a definir) | Grafo de artistas, obras, exposições, publicações, instituições e lugares | Etapa 3 |
| IA Relacional (rota a definir) | Pesquisa em fontes externas com fontes, confiabilidade e prompt visíveis | Etapa 4 |
| `/sobre` (`/en/about`) | Sobre: projeto, metodologia e cartografia | Etapa 2 |

## Documentação

Arquitetura, convenções e roadmap do ecossistema inteiro ficam em [`docs/ai/`](docs/ai/README.md), que também serve de instrução para agentes de IA (`AGENTS.md`, `CLAUDE.md`). Mudanças grandes vão por PR detalhada e só entram na `main` com aprovação do Alisson.

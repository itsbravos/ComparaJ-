# ComparaJá

App comparador de preços, cupons e histórico de ofertas com alertas e busca inteligente por IA (Gemini).

## Funcionalidades

- **Busca de produtos** por texto, código de barras ou foto, com comparação de ofertas entre lojas (preço, PIX, parcelamento, frete, prazo).
- **Histórico de preços** por produto, com gráfico de variação ao longo do tempo.
- **Lista de monitoramento** (wishlist) com meta de preço e alertas.
- **Cupons**: validação de cupons de desconto por loja/categoria.
- **Análise de link**: extrai preço e dados de produto a partir de uma URL de loja.

## Stack

- React 19 + Vite 6 + TypeScript
- Tailwind CSS 4
- Express (servidor de desenvolvimento/produção com API própria)
- [`@google/genai`](https://www.npmjs.com/package/@google/genai) (Gemini) para as funcionalidades de IA

## Rodando localmente

Pré-requisitos: [Bun](https://bun.sh).

```bash
bun install
bun run dev
```

O servidor sobe em `http://localhost:3000`, servindo o frontend (via Vite) e as rotas de API (`/api/search`, `/api/identify-image`, `/api/extract-price`, `/api/validate-coupon`).

Para habilitar as buscas por IA, copie `.env.example` para `.env` e informe sua `GEMINI_API_KEY`. Sem a chave, as rotas de API respondem com dados de exemplo (fallback local).

## Build de produção (com backend)

```bash
bun run build
bun run start
```

Gera `dist/` (frontend) e `dist/server.cjs` (backend Express empacotado), pensado para hospedagem em um serviço que rode Node (ex: Cloud Run, Render, Railway).

## Deploy no GitHub Pages

Este repositório tem um workflow (`.github/workflows/deploy.yml`) que builda o site estático com Vite e publica em GitHub Pages a cada push na branch `main`.

Passo único manual (uma vez só): em `Settings → Pages → Build and deployment → Source`, selecione **GitHub Actions**.

> **Importante:** GitHub Pages só serve arquivos estáticos — ele não roda o backend Express. Por isso a IA (busca, scanner de imagem, análise de link, validação de cupom) é hospedada separadamente na Vercel, ver seção abaixo. Sem essa configuração, as rotas de IA caem no tratamento de erro do app (toast informativo, sem quebrar a página).

## Hospedando a IA na Vercel

O backend (`server/apiRoutes.ts`, com as rotas `/api/search`, `/api/identify-image`, `/api/extract-price`, `/api/validate-coupon`) roda tanto no Express local (`server.ts`) quanto como função serverless na Vercel (`api/index.ts` + `vercel.json`), sem duplicar código.

1. Crie uma conta na [Vercel](https://vercel.com) (login com GitHub, plano gratuito, sem cartão) e importe este repositório como um novo projeto.
2. Em **Project Settings → Environment Variables**, adicione `GEMINI_API_KEY` com sua chave real (Production e Preview). Sem ela, as rotas caem no fallback com dados de exemplo, igual ao comportamento local.
3. Depois do primeiro deploy, copie a URL gerada pela Vercel (ex: `https://compara-ja.vercel.app`).
4. No GitHub, vá em **Settings → Secrets and variables → Actions → Variables** e crie a variável `API_BASE_URL` com essa URL (sem `/` no final). O workflow do GitHub Pages injeta essa URL no build via `VITE_API_BASE_URL`.
5. Faça um novo push (ou re-rode o workflow "Deploy to GitHub Pages") para o site publicado passar a chamar a Vercel.

Em dev local (`bun run dev`), `VITE_API_BASE_URL` fica vazio e os fetches continuam relativos (`/api/...`), servidos pelo próprio `server.ts` — nenhuma mudança de comportamento.

Por segurança, o CORS em `api/index.ts` só libera a origin do GitHub Pages (`https://itsbravos.github.io`). Se o repositório mudar de dono/nome, atualize essa allowlist.

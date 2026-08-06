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

> **Importante:** GitHub Pages só serve arquivos estáticos — ele não roda o backend Express nem chama a API do Gemini. No site publicado em Pages, a interface funciona normalmente com os dados de exemplo iniciais, mas as buscas por IA (`/api/search`, `/api/identify-image`, `/api/validate-coupon`, `/api/extract-price`) não têm servidor para responder e caem no tratamento de erro do app (toast informativo, sem quebrar a página). Para ter a busca por IA funcionando no site publicado, é necessário hospedar o backend separadamente (ex: Cloud Run, Render, Vercel Functions, Cloudflare Workers) e apontar o frontend para essa URL.

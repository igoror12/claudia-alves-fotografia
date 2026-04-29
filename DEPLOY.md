# Guia de Publicação · claudiaalves.pt

Este guia leva o site de **zero a publicado** numa hora. Segue a ordem.

> **Pré-requisitos**: conta GitHub, conta Vercel (Hobby ou Pro), conta Anthropic com créditos, domínio `claudiaalves.pt` (registado em qualquer registar).

---

## Passo 1 · Preparar o repositório local

Abre **PowerShell** na pasta do projeto:

```powershell
cd "C:\Users\igoro\Documents\Claude\Projects\Site Fotografia\claudia-alves-fotografia"

# Limpa o .git fantasma deixado pelo sandbox (se existir)
if (Test-Path .git) { Remove-Item -Recurse -Force .git }

# Inicializa repositório limpo
git init -b main
git add .
git commit -m "Initial commit: site Cláudia Alves Fotografia"
```

Cria um repo privado no GitHub (`claudia-alves-fotografia`) e liga:

```powershell
git remote add origin https://github.com/<o-teu-user>/claudia-alves-fotografia.git
git push -u origin main
```

---

## Passo 2 · Provisionar a Vercel

1. Vai a [vercel.com/new](https://vercel.com/new) e importa o repositório do GitHub.
2. Em **Configure Project**:
   - **Framework Preset**: Next.js (auto-detectado)
   - **Root Directory**: deixa em branco (raiz do repo)
   - **Build Command**: `npm run build` (auto)
   - **Install Command**: `npm install` (auto)
3. **Não cliques Deploy ainda** — falta configurar Storage e env vars.

---

## Passo 3 · Storage

No dashboard do projeto Vercel, vai a **Storage**:

### 3.1 Postgres
1. **Create Database** → **Postgres** (Hobby Free, 256MB).
2. Nome: `claudia-fotografia-db`. Região: `Frankfurt (fra1)` (próximo de Portugal).
3. Clica **Connect** → escolhe o projeto do site.
4. A Vercel injeta automaticamente: `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, `POSTGRES_USER`, etc.

### 3.2 Blob
1. **Create** → **Blob**.
2. Nome: `claudia-fotografia-blob`.
3. **Connect** ao projeto. A Vercel injeta `BLOB_READ_WRITE_TOKEN`.

---

## Passo 4 · Variáveis de ambiente manuais

Em **Settings → Environment Variables** do projeto, adiciona em todos os ambientes (Production / Preview / Development):

| Nome | Valor | Notas |
|---|---|---|
| `NEXTAUTH_SECRET` | `(gera com: openssl rand -base64 32)` | Obrigatório |
| `NEXTAUTH_URL` | `https://claudiaalves.pt` | Em Preview podes usar `${VERCEL_URL}` |
| `ADMIN_EMAIL` | `claudia@claudiaalves.pt` | Conta admin do seed |
| `ADMIN_PASSWORD` | _(escolhe uma forte e guarda no 1Password)_ | Trocada após primeiro login |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | De [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| `ANTHROPIC_MODEL` | `claude-sonnet-4-6` | Default OK |
| `NEXT_PUBLIC_SITE_URL` | `https://claudiaalves.pt` | Usado pelo sitemap |
| `RESEND_API_KEY` | `re_...` _(opcional)_ | Para notificação de contactos |
| `NOTIFY_EMAIL` | `claudia@claudiaalves.pt` _(opcional)_ | Recetor das notificações |

> Gera o secret rápido com PowerShell: `[Convert]::ToBase64String((1..32 | %{Get-Random -Max 256}))`.

---

## Passo 5 · Primeiro deploy

No dashboard do projeto, clica **Deploy**. O build vai:

1. `npm install` → resolve deps.
2. `prisma generate` (postinstall) → gera o cliente Prisma.
3. `next build` → compila SSR/RSC.

Se falhar com `Error: P1001 Can't reach database server`, é normal no primeiro deploy — o build não corre migrations sozinho. Avança para o passo 6 e depois redeploys.

---

## Passo 6 · Inicializar a base de dados

Localmente, com a Vercel CLI:

```powershell
npm install -g vercel
vercel login
vercel link                     # liga a pasta ao projeto
vercel env pull .env.production # baixa as envs

# Cria as tabelas + popula categorias e admin
npx prisma db push --schema prisma/schema.prisma
npx tsx prisma/seed.ts

# Confirma
npx prisma studio   # opcional, GUI em localhost:5555
```

> Em alternativa, podes acrescentar `prisma db push` ao `build` script enquanto o schema for estável (não recomendado em produção a longo prazo — preferir migrations).

---

## Passo 7 · Domínio

Em **Settings → Domains** do projeto Vercel:

1. Adiciona `claudiaalves.pt` e `www.claudiaalves.pt`.
2. A Vercel mostra os DNS records que precisas:
   - **Apex (`claudiaalves.pt`)**: `A` para `76.76.21.21`
   - **`www`**: `CNAME` para `cname.vercel-dns.com`
3. No painel do registar do domínio (ex: GoDaddy, OVH, dnsimple), adiciona esses dois records.
4. Espera 5-30 min pela propagação. A Vercel emite o certificado TLS automaticamente.
5. Em **Domains**, marca `claudiaalves.pt` como **Production Domain** e ativa o redirect de `www` → apex.

---

## Passo 8 · Verificações finais

Já com o domínio a apontar:

| Verificação | Como |
|---|---|
| Home renderiza | `https://claudiaalves.pt` |
| OG image | [opengraph.xyz](https://www.opengraph.xyz/url/https%3A%2F%2Fclaudiaalves.pt) |
| Robots/Sitemap | `claudiaalves.pt/robots.txt` e `/sitemap.xml` |
| Login admin | `claudiaalves.pt/admin/login` com `ADMIN_EMAIL`/`ADMIN_PASSWORD` |
| Upload de foto teste | Arrasta um JPG no admin → confirma que aparece na home (ISR de 10 min — força com `?refresh=1` durante teste) |
| Formulário contacto | Submete um pedido fake → vê a entrada em `prisma studio` com `aiSummary` preenchido |
| Lighthouse | Chrome DevTools → ≥ 90 em todos os eixos esperado |

---

## Passo 9 · Pós-publicação

- Em **Vercel → Settings → General**, ativa **Vercel Analytics** (Hobby tier free).
- Submete o sitemap em [Google Search Console](https://search.google.com/search-console): adiciona a propriedade do domínio, verifica via DNS TXT e indica `https://claudiaalves.pt/sitemap.xml`.
- Agenda backups da DB: na Vercel Postgres, **Settings → Backups** estão ligados por defeito (1× dia, 7 dias retenção). Se quiseres mais, faz um cron com `pg_dump` para um bucket S3 / R2.

---

## Troubleshooting

**Build falha com "Module not found: @prisma/client"**
→ Garante que `npm run build` faz `prisma generate` primeiro (já está em `package.json`). Limpa cache do build na Vercel: **Settings → Data Cache → Purge**.

**Imagens do Blob aparecem em 404**
→ Confirma que `next.config.mjs` tem `*.public.blob.vercel-storage.com` em `images.remotePatterns` (já está).

**`POST /api/admin/photos` dá 504 com fotos grandes**
→ Aumenta `maxDuration` no `vercel.json` (já está em 60s — é o máximo no Hobby tier; em Pro vai até 300s).

**Claude devolve alt-text em PT-BR**
→ Reforça o prompt em `src/lib/ai.ts` ou troca para `claude-opus-4-6` via env var `ANTHROPIC_MODEL`.

**Login admin diz "configuration error"**
→ Falta `NEXTAUTH_SECRET` ou `NEXTAUTH_URL`. Verifica em Settings → Env Vars.

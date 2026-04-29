# Cláudia Alves Fotografia

Site oficial da fotógrafa Cláudia Alves (Braga, Portugal). Portfólio editorial, blog, área de contacto com pré-orçamento por IA e backoffice de gestão de fotografias.

## Stack

- **Next.js 14** (App Router, React Server Components, ISR de 10 min na home)
- **TypeScript** estrito
- **Tailwind CSS** com tokens de design (`--cream`, `--ink`, `--accent`...)
- **Prisma + PostgreSQL** (Vercel Postgres / Neon)
- **NextAuth** (credentials + Prisma adapter, sessão JWT)
- **Vercel Blob** para fotografias
- **Sharp** para gerar 3 variantes WebP responsive + blur placeholder
- **Anthropic Claude** (Sonnet 4.6) para alt-text, categorização e pré-orçamento
- **Resend** (opcional) para notificação por email

## Estrutura

```
src/
  app/
    page.tsx                    # Home (Hero, Galeria, About, Services, Blog, Contact)
    layout.tsx                  # Fontes, metadata SEO
    admin/                      # Backoffice protegido por NextAuth
      login/page.tsx
      page.tsx                  # Dashboard de fotografias
    api/
      auth/[...nextauth]/route.ts
      admin/photos/route.ts     # POST upload, GET listagem
      admin/photos/[id]/route.ts# PATCH edit, DELETE
      contact/route.ts          # POST formulário público
  components/                   # Componentes da home
    admin/                      # Componentes do backoffice
  lib/
    prisma.ts                   # Singleton Prisma
    auth.ts                     # Configuração NextAuth
    image-pipeline.ts           # Sharp + Vercel Blob
    ai.ts                       # Claude Vision (alt, categoria, orçamento)
  styles/globals.css
  middleware.ts                 # Protege /admin
prisma/
  schema.prisma                 # User, Photo, Category, BlogPost, ContactRequest
  seed.ts                       # 3 categorias base + conta admin
```

## Setup local

1. Copia `.env.example` para `.env` e preenche:

   ```bash
   cp .env.example .env
   ```

   Variáveis essenciais para arrancar (resto é opcional):

   ```
   POSTGRES_PRISMA_URL=...
   POSTGRES_URL_NON_POOLING=...
   BLOB_READ_WRITE_TOKEN=...
   NEXTAUTH_SECRET=$(openssl rand -base64 32)
   NEXTAUTH_URL=http://localhost:3000
   ADMIN_EMAIL=claudia@claudiaalves.pt
   ADMIN_PASSWORD=trocar-em-producao
   ANTHROPIC_API_KEY=sk-ant-...
   ```

2. Instala dependências e prepara a base de dados:

   ```bash
   npm install
   npm run db:push      # cria tabelas a partir do schema
   npm run db:seed      # cria categorias + conta admin
   ```

3. Arranca em desenvolvimento:

   ```bash
   npm run dev
   ```

   - Site público: `http://localhost:3000`
   - Backoffice: `http://localhost:3000/admin/login`

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Next em modo desenvolvimento |
| `npm run build` | `prisma generate` + build de produção |
| `npm run start` | Servir build de produção |
| `npm run lint` | ESLint (config Next) |
| `npm run db:push` | Sincroniza schema Prisma → PostgreSQL (sem migration) |
| `npm run db:migrate` | Cria nova migration em `prisma/migrations/` |
| `npm run db:studio` | UI Prisma Studio em `localhost:5555` |
| `npm run db:seed` | Popula categorias base e conta admin |

## Pipeline de upload de fotografias

```
Admin arrasta JPG/PNG/TIFF (≤25MB)
  └─ POST multipart /api/admin/photos
       ├─ Sharp: rotate(EXIF) → sRGB → 3 variantes WebP (400/1200/2400)
       ├─ Sharp: blur placeholder 16px (data URL)
       ├─ Vercel Blob: upload paralelo das 4 imagens
       ├─ Claude Vision: alt-text PT-PT + 5-8 keywords SEO
       ├─ Claude Vision: categorização (retratos/casamentos/eventos)
       └─ Prisma: persiste Photo
```

A home usa `revalidate = 600` (ISR de 10 min) para puxar fotos novas sem redeploy.

## Pipeline de contacto

```
Visitante submete formulário
  └─ POST /api/contact
       ├─ Zod valida + honeypot + rate-limit em memória
       ├─ Prisma: cria ContactRequest (não esperamos pela IA)
       ├─ [async] Claude: resumo executivo + gama €X-€Y
       └─ [async] Resend: notifica claudia@claudiaalves.pt (se config.)
```

## Deploy (Vercel)

1. Liga o repositório a um projeto Vercel.
2. Adiciona uma **Vercel Postgres** e um **Vercel Blob** em Storage → Connect.
3. Define no painel as envs do `.env.example` (todas exceto `POSTGRES_*`/`BLOB_*` que vêm da integração).
4. Primeiro deploy:
   - Build executa `prisma generate` automaticamente (via `postinstall`).
   - Após o deploy: `vercel env pull` localmente e corre `npm run db:push && npm run db:seed`.

Domínio recomendado: `claudiaalves.pt`. O `metadata.alternates.canonical` em `app/layout.tsx` aponta para lá.

## Acessibilidade e performance

- `prefers-reduced-motion` desliga animações (`globals.css`).
- Todas as fotografias têm `altText` (gerado pela IA mas editável no admin).
- `next/image` serve AVIF/WebP com srcset auto a partir das variantes do Sharp.
- Blur placeholder evita layout shift.
- Fontes Google self-hosted via `next/font` (zero requests externos em runtime).

## Próximos passos previstos

- Páginas individuais por categoria (`/galeria/casamentos`)
- Página individual de blog post (`/blog/[slug]`)
- Lightbox com swipe em mobile
- Newsletter (Resend Audiences)
- Integração com Google Analytics / Plausible

# 🚀 Deploy ALM Distribuidora no Vercel

Guia rápido pra colocar o sistema no ar com domínio temporário (`*.vercel.app`) pro Aurélio testar de Ubá/MG.

---

## ✅ O que JÁ está pronto

- Código commitado localmente (branch `main`)
- `vercel.json` configurado
- Build local testado e funcionando ✅
- Dual schema Prisma: SQLite (dev) / Postgres (Vercel)
- `.env.example` documentado
- `.gitignore` protegendo `.env`, `dev.db`, `node_modules`

---

## 📋 Passo a passo

### PARTE 1 — Subir o código pro GitHub

#### Opção A: GitHub Desktop (recomendado, 2 min)

1. Abre o **GitHub Desktop**
2. **File** → **Add local repository** → escolhe a pasta `C:\Users\Matheus\Documents\Matheus Docs\MinimaX\ALM\alm-sistema`
3. Clica em **"Publish repository"** (botão azul no topo)
   - **Name:** `alm-distribuidora`
   - **Description:** `Sistema de gestão de pedidos - ALM Distribuidora`
   - ☑️ Mantém **Private** desmarcado se quiser público (ou marca Private pra ficar só seu)
4. Confirma no GitHub que apareceu `github.com/faccod/alm-distribuidora`

#### Opção B: Token via CLI (mais rápido pra mim fazer)

- Cola o token aqui na conversa e eu subo o código e crio o repo pra você.

---

### PARTE 2 — Criar o banco Postgres no Neon (5 min)

1. Acessa **https://neon.tech** e clica em **Sign Up** (entra com GitHub)
2. Clica em **"Create a project"**
   - **Name:** `alm-distribuidora`
   - **Region:** `AWS / São Paulo (sa-east-1)` ← IMPORTANTE pra ficar perto do Brasil
   - **Postgres version:** 16 (padrão)
3. Clica em **"Create project"**
4. Na tela que abrir, copia a **Connection string** (começa com `postgresql://...`)
   - Exemplo: `postgresql://neondb_owner:abc123@ep-xyz.sa-east-1.aws.neon.tech/neondb?sslmode=require`
   - ⚠️ **Escolhe a branch `main` (não main-branch)** — tem 2 campos, pega o principal

---

### PARTE 3 — Deploy no Vercel (5 min)

1. Acessa **https://vercel.com** e clica em **"Sign Up"** (entra com GitHub)
2. Clica em **"Add New… Project"**
3. Seleciona **`faccod/alm-distribuidora`** da lista de repos
4. Clica em **"Import"**
5. Na tela de configuração, **NÃO precisa mudar quase nada**, só:
   - **Framework Preset:** Next.js (já vem)
   - **Root Directory:** `./` (deixa vazio)
   - **Build & Development Settings:** deixa padrão (já configurado no `vercel.json`)
6. Em **"Environment Variables"** (clica pra expandir), adiciona:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | (cola a connection string do Neon aqui) |
   | `SESSION_SECRET` | (qualquer string aleatória, ex: `alm-prod-2026-aurelio`) |

7. Clica em **"Deploy"** 🚀
8. Espera 2-3 minutos. Vai aparecer "🎉 Congratulations!" quando terminar
9. Clica em **"Visit"** pra abrir o site
10. A URL vai ser tipo: **`https://alm-distribuidora.vercel.app`**

---

### PARTE 4 — Criar as tabelas no Postgres (2 min)

O Vercel já fez o build, mas o banco tá vazio. Precisa criar as tabelas:

1. No painel do Vercel, vai em **Settings** → **Functions** → **Logs** (vai abrir o terminal)
   
   OU mais fácil:
   
2. No painel do Vercel, clica nos **3 pontinhos** do deploy → **"Open build logs"** (mas o seed precisa rodar DEPOIS)

**Forma mais fácil (recomendado):**

1. Vai no painel do **Neon** → **SQL Editor** (menu lateral)
2. Cola e roda esses comandos um por um:

```sql
-- Cria extensão UUID (boa prática)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

3. Volta pro **GitHub Desktop** ou terminal:

   No PowerShell, na pasta do projeto:
   ```powershell
   cd "C:\Users\Matheus\Documents\Matheus Docs\MinimaX\ALM\alm-sistema"
   $env:DATABASE_URL = "postgresql://neondb_owner:SUA_SENHA@ep-xyz.sa-east-1.aws.neon.tech/neondb?sslmode=require"
   npx prisma db push --schema=prisma/schema.production.prisma
   node prisma/seed.mjs
   ```

   Isso vai:
   - Criar todas as tabelas no Neon
   - Popular com os dados de exemplo (Aurélio, clientes, produtos, etc)

---

### PARTE 5 — Testar (1 min)

Abre **`https://alm-distribuidora.vercel.app`** no celular e:

- Login: `aurelio@alm.com` / `vendedor123` ← já tá como **ADMIN**
- Faz um pedido de teste
- Loga como `cd@alm.com` / `cd123` (Centro de Distribuição) e muda o status
- Manda a URL pro Aurélio

---

## 🎁 Bônus: domínio próprio (depois)

Quando quiser usar `alm.com.br` em vez de `alm-distribuidora.vercel.app`:

1. Compra o domínio no Registro.br
2. No Vercel: **Settings** → **Domains** → **Add** → digita `seudominio.com.br`
3. Copia os registros DNS que o Vercel mostrar
4. Cola no painel do Registro.br (modo avançado, A + CNAME — **NÃO troca nameservers**)

---

## 🆘 Problemas comuns

### Build falhou: "Cannot find module '@prisma/client'"

- Vai em **Settings** → **General** → **Build & Development Settings**
- Confirma que **Install Command** está: `npm install --include=dev`

### Site carrega mas dá erro "tabela X não existe"

- Você pulou a Parte 4. Roda os comandos do `prisma db push`.

### Login não funciona / sessão some toda hora

- Verifica se `SESSION_SECRET` foi setado nas env vars do Vercel.

### Aurélio tá longe e demora pra carregar

- Confirma que o Neon tá em **sa-east-1 (São Paulo)**.

---

*Sistema desenvolvido por Matheus Krause · 2026*

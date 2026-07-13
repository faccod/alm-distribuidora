# ALM Distribuidora — Sistema de Pedidos

Sistema de pedidos mobile-first para a ALM Distribuidora, com PWA instalável, modo offline, painel do CD e relatórios automáticos.

## 🚀 Como rodar local

```bash
# Instalar dependências
npm install

# Criar o banco (SQLite local)
npx prisma db push

# Popular com dados de exemplo
node prisma/seed.mjs

# Subir o servidor
npm run dev
```

Acesse: **http://localhost:3003**

## 👤 Logins padrão (demo)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | aurelio@alm.com | vendedor123 |

**IMPORTANTE:** Troque essas senhas antes de colocar em produção.

## 📱 Como instalar no celular (PWA)

1. Abra o link do sistema no Chrome (Android) ou Safari (iPhone)
2. **Android:** Menu (⋮) → "Adicionar à tela inicial"
3. **iPhone:** Botão de compartilhar → "Adicionar à Tela de Início"
4. O ícone "ALM" aparece no celular como se fosse um app

## 📦 Funcionalidades

### Para o vendedor (Aurélio)
- ✅ Criar pedido pelo celular (mobile-first, rápido)
- ✅ **Funciona OFFLINE** — salva na fila local e envia quando voltar o sinal
- ✅ Catálogo de produtos com busca
- ✅ Cadastro rápido de clientes
- ✅ Histórico do cliente na cara (top produtos que ele sempre pede)
- ✅ Impressão no formato do talonário antigo
- ✅ Envio do pedido por WhatsApp

### Para o CD (centro de distribuição)
- ✅ Painel dedicado com fila de separação
- ✅ Marcar status: Em separação → Despachado → Entregue
- ✅ **Imprimir rota de separação** (pedidos agrupados por cidade)

### Para o gerente
- ✅ Dashboard com vendas do mês
- ✅ Relatórios por cidade/rota
- ✅ Top clientes e top produtos
- ✅ Gerenciamento de usuários (criar vendedor, CD, etc)
- ✅ Importador em massa de clientes e produtos (cola Excel/CSV)

## 🔧 Stack técnica

- **Next.js 14** (App Router)
- **Prisma + SQLite** (desenvolvimento) — fácil de migrar pra Postgres em produção
- **Tailwind CSS** (mobile-first)
- **IndexedDB** pra fila offline
- **PWA** instalável
- **bcryptjs** pra hash de senhas
- Cookie de sessão próprio (sem dependência externa de auth)

## 📁 Estrutura

```
alm-sistema/
├── app/
│   ├── api/          # Endpoints (login, pedidos, clientes, etc)
│   ├── clientes/     # CRUD de clientes
│   ├── pedidos/      # Criar, listar, detalhe, imprimir
│   ├── produtos/     # CRUD de produtos
│   ├── cd/           # Painel do CD
│   ├── relatorios/   # Relatórios por cidade, top clientes, top produtos
│   ├── usuarios/     # Gerenciamento de usuários
│   ├── login/        # Tela de login
│   └── layout.tsx
├── components/       # Componentes compartilhados
├── lib/              # Prisma, auth, offline, format
├── prisma/           # Schema + seed
└── public/           # PWA manifest, service worker
```

## 🔐 Segurança

- Senhas com hash bcrypt (10 rounds)
- Sessão em cookie httpOnly + sameSite=lax
- Verificação de perfil (VENDEDOR, GERENTE, CD, ADMIN) em cada rota sensível
- API sempre valida sessão

## 🌍 Como fazer deploy em produção

### Opção 1: Vercel (recomendado, grátis)

1. Suba o código pro GitHub
2. Crie conta no [Vercel](https://vercel.com)
3. Importe o repositório
4. Crie banco no [Neon](https://neon.tech) (grátis) ou [Supabase](https://supabase.com)
5. Configure a env var `DATABASE_URL` no Vercel com a URL do Postgres
6. **Mude o provider do Prisma** de `sqlite` pra `postgresql` em `prisma/schema.prisma`
7. Deploy!

### Opção 2: Servidor próprio (VPS)

```bash
npm install
npm run build
DATABASE_URL=file:./prod.db npx prisma db push
DATABASE_URL=file:./prod.db node prisma/seed.mjs
npm start
```

Recomendado: usar **PM2** ou **systemd** pra manter o processo rodando.

## 📝 Próximas melhorias (TODO)

- [ ] Migração pra Postgres (Vercel/Neon)
- [ ] Notificações push (PWA)
- [ ] Scanner de código de barras (câmera)
- [ ] Alerta de pedidos atrasados (passou de X dias)
- [ ] Envio automático do pedido pro CD por e-mail
- [ ] Controle de estoque
- [ ] Financeiro (contas a receber, baixa de boleto)
- [ ] App nativo Android/iOS (se o volume justificar)

## 🐛 Problemas conhecidos

- **"Cannot find module 'tailwindcss'"**: rodar `npm install` novamente
- **Cookie não persiste**: limpar cookies do navegador e logar de novo
- **Service Worker não atualiza**: no DevTools → Application → Service Workers → "Update on reload"

import { redirect } from 'next/navigation';
import { getSessao } from '../lib/auth';
import { prisma } from '../lib/prisma';
import { brl } from '../lib/format';
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  Clock,
  ChevronRight,
  PlusCircle,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import Link from 'next/link';
import VendasChart from '../components/vendas-chart';
import { ThemeToggle } from '../components/theme-toggle';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const inicioMesPassado = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const fimMesPassado = new Date(new Date().getFullYear(), new Date().getMonth(), 0, 23, 59, 59);

  const [
    totalClientes,
    totalProdutos,
    totalUsuarios,
    vendasMes,
    vendasMesPassado,
    pedidosMes,
    ultimos,
    pedidosAtrasados,
    produtosEstoqueBaixo,
  ] = await Promise.all([
    prisma.cliente.count({ where: { ativo: true } }),
    prisma.produto.count({ where: { ativo: true } }),
    prisma.usuario.count({ where: { ativo: true } }),
    prisma.pedido.aggregate({
      _sum: { total: true },
      _count: true,
      where: { data: { gte: inicioMes }, status: { not: 'CANCELADO' } },
    }),
    prisma.pedido.aggregate({
      _sum: { total: true },
      _count: true,
      where: { data: { gte: inicioMesPassado, lte: fimMesPassado }, status: { not: 'CANCELADO' } },
    }),
    prisma.pedido.findMany({
      where: { data: { gte: inicioMes }, status: { not: 'CANCELADO' } },
      select: { data: true, total: true },
    }),
    prisma.pedido.findMany({
      take: 6,
      orderBy: { data: 'desc' },
      include: { cliente: true, _count: { select: { itens: true } } },
    }),
    prisma.pedido.findMany({
      where: {
        status: { in: ['ENVIADO', 'EM_SEPARACAO'] },
        data: { lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      },
      include: { cliente: true },
      take: 5,
    }),
    prisma.produto.findMany({
      where: { ativo: true },
      take: 100,
    }).then((ps) => ps.filter((p) => p.estoque <= p.estoqueMinimo).slice(0, 5)),
  ]);

  const variacao =
    vendasMesPassado._sum.total && Number(vendasMesPassado._sum.total) > 0
      ? (((vendasMes._sum.total ?? 0) - Number(vendasMesPassado._sum.total)) /
          Number(vendasMesPassado._sum.total)) *
        100
      : 0;

  // Vendas por dia (últimos 14)
  const ultimos14: { data: string; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const dia = new Date();
    dia.setDate(dia.getDate() - i);
    dia.setHours(0, 0, 0, 0);
    const prox = new Date(dia);
    prox.setDate(prox.getDate() + 1);
    const total = pedidosMes
      .filter((p) => new Date(p.data) >= dia && new Date(p.data) < prox)
      .reduce((s, p) => s + p.total, 0);
    ultimos14.push({
      data: dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      total,
    });
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center text-white dark:text-slate-900 font-black">
              A
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Bem-vindo,</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{sessao.nome.split(' ')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action="/api/logout" method="POST">
              <Button variant="ghost" size="sm" type="submit">Sair</Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6 animate-fade-in">
        {/* KPIs principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Vendas do mês</p>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">
                    {brl(vendasMes._sum.total ?? 0)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className={`w-3 h-3 ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-xs font-semibold ${variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variacao >= 0 ? '+' : ''}{variacao.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500">vs mês anterior</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pedidos</p>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">
                    {vendasMes._count}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">no mês atual</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Clientes</p>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">{totalClientes}</p>
                  <p className="text-xs text-slate-500 mt-2">cadastrados</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Produtos</p>
                  <p className="text-2xl font-black mt-1 text-slate-900 dark:text-slate-100">{totalProdutos}</p>
                  <p className="text-xs text-slate-500 mt-2">no catálogo</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de vendas */}
        <Card>
          <CardHeader>
            <CardTitle>Vendas dos últimos 14 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <VendasChart data={ultimos14} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Pedidos atrasados / alertas */}
          {(pedidosAtrasados.length > 0 || produtosEstoqueBaixo.length > 0) && (
            <Card className="border-amber-200 dark:border-amber-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                  Atenção necessária
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pedidosAtrasados.length > 0 && (
                  <Link
                    href="/pedidos"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span className="text-sm">
                        <b>{pedidosAtrasados.length}</b> pedido(s) parados há mais de 3 dias
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                )}
                {produtosEstoqueBaixo.length > 0 && (
                  <Link
                    href="/produtos"
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600" />
                      <span className="text-sm">
                        <b>{produtosEstoqueBaixo.length}</b> produto(s) com estoque baixo
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button asChild variant="accent" size="lg" className="h-14">
                <Link href="/pedidos/novo">
                  <PlusCircle className="w-5 h-5" />
                  Novo pedido
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14">
                <Link href="/clientes/novo">
                  <Users className="w-5 h-5" />
                  Novo cliente
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14">
                <Link href="/cd">
                  <Truck className="w-5 h-5" />
                  Painel CD
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14">
                <Link href="/relatorios">
                  <TrendingUp className="w-5 h-5" />
                  Relatórios
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Últimos pedidos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Últimos pedidos</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/pedidos">Ver todos <ChevronRight className="w-4 h-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {ultimos.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Nenhum pedido ainda.</p>
            ) : (
              <div className="space-y-2">
                {ultimos.map((p) => (
                  <Link
                    key={p.id}
                    href={`/pedidos/${p.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0">
                        #{p.numero}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {p.cliente.nome}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(p.data).toLocaleDateString('pt-BR')} · {p._count.itens} itens
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{brl(p.total)}</p>
                      <StatusBadge status={p.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    RASCUNHO: { label: 'Rascunho', variant: 'secondary' },
    ENVIADO: { label: 'Enviado', variant: 'info' },
    EM_SEPARACAO: { label: 'Separando', variant: 'warning' },
    DESPACHADO: { label: 'Despachado', variant: 'info' },
    ENTREGUE: { label: 'Entregue', variant: 'success' },
    CANCELADO: { label: 'Cancelado', variant: 'danger' },
  };
  const s = map[status] || { label: status, variant: 'secondary' };
  return <Badge variant={s.variant} className="mt-1">{s.label}</Badge>;
}

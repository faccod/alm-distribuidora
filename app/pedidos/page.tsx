import { prisma } from '../../lib/prisma';
import { buscarSessao } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { brl, STATUS_COR, STATUS_LABEL } from '../../lib/format';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, ShoppingCart, ArrowLeft, Calendar, User } from 'lucide-react';
import { Input } from '../../components/ui/input';

export const dynamic = 'force-dynamic';

const STATUS_VARIANT: any = {
  RASCUNHO: 'secondary',
  ENVIADO: 'info',
  EM_SEPARACAO: 'warning',
  DESPACHADO: 'info',
  ENTREGUE: 'success',
  CANCELADO: 'danger',
};

export default async function Page({ searchParams }: { searchParams: { q?: string; status?: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');

  const q = searchParams.q || '';
  const status = searchParams.status || '';

  const pedidos = await prisma.pedido.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { numero: { equals: parseInt(q) || 0 } },
              { cliente: { nome: { contains: q } } },
            ],
          }
        : {}),
    },
    orderBy: { data: 'desc' },
    include: { cliente: true, vendedor: true, _count: { select: { itens: true } } },
    take: 200,
  });

  const stats = {
    total: pedidos.length,
    pendentes: pedidos.filter((p) => ['ENVIADO', 'EM_SEPARACAO'].includes(p.status)).length,
    entregues: pedidos.filter((p) => p.status === 'ENTREGUE').length,
    valorTotal: pedidos.reduce((s, p) => s + p.total, 0),
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pedidos</h1>
          <p className="text-sm text-slate-500">{stats.total} no total</p>
        </div>
        <Button asChild variant="accent">
          <Link href="/pedidos/novo"><Plus className="w-4 h-4" />Novo pedido</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-2xl font-black mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Pendentes</p>
            <p className="text-2xl font-black mt-1 text-amber-600">{stats.pendentes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Entregues</p>
            <p className="text-2xl font-black mt-1 text-green-600">{stats.entregues}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Valor total</p>
            <p className="text-xl font-black mt-1 text-green-600">{brl(stats.valorTotal)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="flex flex-col sm:flex-row gap-2">
            <Input
              name="q"
              defaultValue={q}
              placeholder="🔍 Buscar por número ou cliente..."
              className="flex-1"
            />
            <div className="flex gap-1 overflow-x-auto">
              <Link
                href="/pedidos"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                  !status ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Todos
              </Link>
              {Object.entries(STATUS_LABEL).map(([k, label]) => (
                <Link
                  key={k}
                  href={`/pedidos?status=${k}`}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                    status === k ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </form>
        </CardContent>
      </Card>

      {pedidos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">Nenhum pedido encontrado</p>
            <Button asChild variant="accent" className="mt-4">
              <Link href="/pedidos/novo"><Plus className="w-4 h-4" />Criar primeiro pedido</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {pedidos.map((p) => (
                <Link
                  key={p.id}
                  href={`/pedidos/${p.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0 text-sm">
                      #{p.numero}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {p.cliente.nome}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(p.data).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {p.vendedor.nome.split(' ')[0]}
                        </span>
                        <span>{p._count.itens} itens</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{brl(p.total)}</p>
                    <Badge variant={STATUS_VARIANT[p.status]} className="mt-1">
                      {STATUS_LABEL[p.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
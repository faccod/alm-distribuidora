import { prisma } from '../../lib/prisma';
import { getSessao } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { brl } from '../../lib/format';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Plus, Upload, Users, AlertCircle, MapPin, Phone } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import Link from 'next/link';
import ThemeBackButton from '../../components/theme-back-button';
import ClientesListClient from './clientes-client';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: { q?: string; uf?: string; status?: string } }) {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const busca = searchParams.q || '';
  const uf = searchParams.uf || '';
  const status = searchParams.status || '';

  const clientes = await prisma.cliente.findMany({
    where: {
      ativo: true,
      ...(busca
        ? [
            { nome: { contains: busca } },
            { nomeFantasia: { contains: busca } },
            { cidade: { contains: busca } },
            { cpfCnpj: { contains: busca } },
          ]
        : undefined),
      ...(uf ? { estado: uf } : {}),
      ...(status ? { statusFinanc: status } : {}),
    },
    orderBy: { nome: 'asc' },
    include: {
      _count: { select: { pedidos: true } },
      pedidos: {
        select: { total: true },
      },
    },
    take: 500,
  });

  const stats = {
    total: clientes.length,
    inadimplentes: clientes.filter((c) => c.statusFinanc === 'INADIMPLENTE').length,
    cidadesUnicas: new Set(clientes.filter((c) => c.cidade).map((c) => c.cidade)).size,
    totalGasto: clientes.reduce(
      (s, c) => s + c.pedidos.reduce((t, p) => t + p.total, 0),
      0
    ),
  };

  const ufs = Array.from(new Set(clientes.map((c) => c.estado).filter(Boolean))) as string[];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ThemeBackButton href="/" />
            <div>
              <h1 className="text-lg font-bold">Clientes</h1>
              <p className="text-xs text-slate-500">{stats.total} cadastrados</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/clientes/importar"><Upload className="w-4 h-4" />Importar</Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link href="/clientes/novo"><Plus className="w-4 h-4" />Novo</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-2xl font-black mt-1">{stats.total}</p>
                </div>
                <Users className="w-5 h-5 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Cidades</p>
              <p className="text-2xl font-black mt-1">{stats.cidadesUnicas}</p>
            </CardContent>
          </Card>
          <Card className={stats.inadimplentes > 0 ? 'border-red-200 dark:border-red-900/40' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Inadimplentes</p>
                  <p className="text-2xl font-black mt-1 text-red-600">{stats.inadimplentes}</p>
                </div>
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Total vendido</p>
              <p className="text-xl font-black mt-1 text-green-600">{brl(stats.totalGasto)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <ClientesListClient ufs={ufs} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {clientes.map((c) => {
            const totalGasto = c.pedidos.reduce((s, p) => s + p.total, 0);
            const ticket = c.pedidos.length > 0 ? totalGasto / c.pedidos.length : 0;
            const tags = c.tags ? c.tags.split(',').filter(Boolean) : [];
            return (
              <Link
                key={c.id}
                href={`/clientes/${c.id}`}
                className="block p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm truncate">{c.nome}</h3>
                    {c.nomeFantasia && c.nomeFantasia !== c.nome && (
                      <p className="text-xs text-slate-500 truncate">{c.nomeFantasia}</p>
                    )}
                  </div>
                  {c.statusFinanc === 'INADIMPLENTE' && <Badge variant="danger">Inadimplente</Badge>}
                  {c.statusFinanc === 'BLOQUEADO' && <Badge variant="danger">Bloqueado</Badge>}
                </div>

                {(c.cidade || c.estado) && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <MapPin className="w-3 h-3" />
                    {c.cidade}/{c.estado}
                  </div>
                )}
                {c.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                    <Phone className="w-3 h-3" />
                    {c.email}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {tags.map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px]">
                        {t.trim()}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-end justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500">{c._count.pedidos} pedidos</p>
                    <p className="text-xs text-slate-500">Ticket: {brl(ticket)}</p>
                  </div>
                  <p className="text-base font-bold text-green-600">{brl(totalGasto)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

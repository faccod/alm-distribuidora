import { prisma } from '../../lib/prisma';
import { buscarSessao } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { brl } from '../../lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Package, Plus, Search, AlertTriangle, TrendingUp, Edit, Upload, Star, BookOpen } from 'lucide-react';
import { EmptyState } from '../../components/ui/empty-state';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import Link from 'next/link';
import ThemeBackButton from '../../components/theme-back-button';
import ProdutosListClient from './produtos-client';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: { cat?: string; q?: string; status?: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');

  const busca = searchParams.q || '';
  const cat = searchParams.cat ? parseInt(searchParams.cat) : null;
  const status = searchParams.status; // baixo | destaque | sem_estoque

  const [categorias, marcas, produtos] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { ordem: 'asc' } }),
    prisma.marca.findMany({ orderBy: { nome: 'asc' } }),
    prisma.produto.findMany({
      where: {
        ativo: true,
        ...(cat ? { categoriaId: cat } : {}),
        ...(busca ? { nome: { contains: busca } } : {}),
      },
      orderBy: { nome: 'asc' },
      include: { categoria: true, marca: true },
      take: 500,
    }),
  ]);

  let lista = produtos;
  if (status === 'baixo') lista = lista.filter((p) => p.estoque <= p.estoqueMinimo);
  if (status === 'sem_estoque') lista = lista.filter((p) => p.estoque === 0);
  if (status === 'destaque') lista = lista.filter((p) => p.destaque);

  const stats = {
    total: produtos.length,
    baixoEstoque: produtos.filter((p) => p.estoque <= p.estoqueMinimo).length,
    semEstoque: produtos.filter((p) => p.estoque === 0).length,
    valorEstoque: produtos.reduce((s, p) => s + p.precoCusto * p.estoque, 0),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ThemeBackButton href="/" />
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Produtos</h1>
              <p className="text-xs text-slate-500">{stats.total} no catálogo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/produtos/catalog"><BookOpen className="w-4 h-4" />Catálogo</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/produtos/importar"><Upload className="w-4 h-4" />Importar</Link>
            </Button>
            <Button asChild variant="accent" size="sm">
              <Link href="/produtos/novo"><Plus className="w-4 h-4" />Novo</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-4 animate-fade-in">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-2xl font-black mt-1">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Valor em estoque</p>
              <p className="text-xl font-black mt-1 text-green-600">{brl(stats.valorEstoque)}</p>
            </CardContent>
          </Card>
          <Card className={stats.baixoEstoque > 0 ? 'border-amber-200 dark:border-amber-900/40' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Estoque baixo</p>
                  <p className="text-2xl font-black mt-1 text-amber-600">{stats.baixoEstoque}</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.semEstoque > 0 ? 'border-red-200 dark:border-red-900/40' : ''}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">Sem estoque</p>
              <p className="text-2xl font-black mt-1 text-red-600">{stats.semEstoque}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <ProdutosListClient categorias={categorias} marcas={marcas} />
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            {lista.length === 0 ? (
              <EmptyState
                icon={<Package className="w-8 h-8" />}
                title="Nenhum produto encontrado"
                description="Cadastre seu primeiro produto ou ajuste os filtros"
                action={
                  <Button asChild variant="accent">
                    <Link href="/produtos/novo"><Plus className="w-4 h-4" />Novo produto</Link>
                  </Button>
                }
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Custo</TableHead>
                    <TableHead className="text-right">Venda</TableHead>
                    <TableHead className="text-center">Estoque</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lista.map((p) => {
                    const margem = p.precoCusto > 0 ? ((p.precoTabela - p.precoCusto) / p.precoCusto) * 100 : 0;
                    const baixoEstoque = p.estoque <= p.estoqueMinimo;
                    const semEstoque = p.estoque === 0;
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: (p.categoria.cor || '#64748b') + '20' }}
                            >
                              <Package className="w-5 h-5" style={{ color: p.categoria.cor || '#64748b' }} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-sm truncate">{p.nome}</p>
                                {p.destaque && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                              </div>
                              {p.sku && <p className="text-xs text-slate-500 font-mono">SKU: {p.sku}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" style={{ backgroundColor: (p.categoria.cor || '#64748b') + '20', color: p.categoria.cor || '#64748b' }}>
                            {p.categoria.nome}
                          </Badge>
                          {p.marca && <p className="text-xs text-slate-500 mt-0.5">{p.marca.nome}</p>}
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {brl(p.precoCusto)}
                          {p.precoCusto > 0 && (
                            <p className="text-xs text-green-600 font-semibold">+{margem.toFixed(0)}%</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-bold">{brl(p.precoTabela)}</TableCell>
                        <TableCell className="text-center">
                          {semEstoque ? (
                            <Badge variant="danger">Sem estoque</Badge>
                          ) : baixoEstoque ? (
                            <Badge variant="warning">⚠ {p.estoque}</Badge>
                          ) : (
                            <span className="text-sm font-semibold">{p.estoque}</span>
                          )}
                          <p className="text-xs text-slate-500">/ mín {p.estoqueMinimo}</p>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/produtos/${p.id}`}><Edit className="w-4 h-4" /></Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
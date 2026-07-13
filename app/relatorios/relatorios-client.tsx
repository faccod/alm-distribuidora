'use client';
import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { brl } from '../../lib/format';
import {
  TrendingUp, ShoppingCart, Users, Package, MapPin, BarChart3,
  Filter, X, Download, Calendar,
} from 'lucide-react';
import VendasChart from '../../components/vendas-chart';
import VendasCategoriaChart from '../../components/vendas-categoria-chart';

type Cliente = { id: string; nome: string };
type Categoria = { id: number; nome: string; cor: string | null; icone: string | null };
type Vendedor = { id: string; nome: string };

const STATUS_OPCOES = [
  { value: '', label: 'Todos' },
  { value: 'ENVIADO', label: 'Enviado' },
  { value: 'EM_SEPARACAO', label: 'Em separação' },
  { value: 'DESPACHADO', label: 'Despachado' },
  { value: 'ENTREGUE', label: 'Entregue' },
];

const PERIODO_OPCOES = [
  { value: '7d', label: '7 dias' },
  { value: '15d', label: '15 dias' },
  { value: '30d', label: '30 dias' },
  { value: '60d', label: '60 dias' },
  { value: '90d', label: '90 dias' },
  { value: 'custom', label: 'Personalizado' },
];

export default function RelatoriosClient({
  filtros,
  opcoes,
  kpis,
  dados,
}: {
  filtros: { periodo: string; clienteId: string; categoriaId: string; vendedorId: string; status: string; dataIni: string; dataFim: string };
  opcoes: { clientes: Cliente[]; categorias: Categoria[]; vendedores: Vendedor[] };
  kpis: { totalVendas: number; totalPedidos: number; clientesUnicos: number; ticketMedio: number; itensTotais: number };
  dados: any;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [filtrosLocal, setFiltrosLocal] = useState(filtros);

  const filtrosAtivos = useMemo(() => {
    const ativos: string[] = [];
    if (filtros.clienteId) ativos.push('Cliente');
    if (filtros.categoriaId) ativos.push('Categoria');
    if (filtros.vendedorId) ativos.push('Vendedor');
    if (filtros.status) ativos.push('Status');
    if (filtros.dataIni && filtros.dataFim) ativos.push('Período custom');
    return ativos;
  }, [filtros]);

  function aplicar(novos: any) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(novos).forEach(([k, v]) => {
      if (v === '' || v === null || v === undefined) sp.delete(k);
      else sp.set(k, String(v));
    });
    router.push('/relatorios?' + sp.toString());
  }

  function limpar() {
    router.push('/relatorios');
  }

  function exportarCSV() {
    // Gera CSV dos pedidos do período
    const linhas = ['Pedido,Data,Cliente,Cidade,UF,Vendedor,Itens,Total,Status'];
    // ... implementação real pegaria os dados via API
    // Por enquanto, exporta a lista de top produtos
    let csv = 'Relatorio ALM - ' + new Date().toLocaleString('pt-BR') + '\n\n';
    csv += 'TOP CLIENTES\n';
    csv += 'Nome;Cidade;Pedidos;Total\n';
    for (const c of dados.topClientes) {
      csv += `${c.nome};${c.cidade};${c.pedidos};${c.total.toFixed(2)}\n`;
    }
    csv += '\nTOP PRODUTOS\n';
    csv += 'Nome;Categoria;Quantidade;Receita\n';
    for (const p of dados.topProdutos) {
      csv += `${p.nome};${p.categoria};${p.quantidade};${p.receita.toFixed(2)}\n`;
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-alm-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />Relatórios
          </h1>
          <p className="text-sm text-slate-500">Vendas, clientes, produtos, rotas</p>
        </div>
        <Button onClick={exportarCSV} variant="outline">
          <Download className="w-4 h-4" />Exportar CSV
        </Button>
      </div>

      {/* === FILTROS === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />Filtros
            {filtrosAtivos.length > 0 && (
              <Badge variant="info" className="ml-1">{filtrosAtivos.length} ativo(s)</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Período */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Período</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {PERIODO_OPCOES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => aplicar({ periodo: p.value, dataIni: '', dataFim: '' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    filtros.periodo === p.value
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Período customizado */}
          {filtros.periodo === 'custom' && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <label className="text-xs font-semibold">De</label>
                <Input type="date" value={filtros.dataIni} onChange={(e) => aplicar({ dataIni: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold">Até</label>
                <Input type="date" value={filtros.dataFim} onChange={(e) => aplicar({ dataFim: e.target.value })} />
              </div>
            </div>
          )}

          {/* Outros filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cliente</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm mt-1"
                value={filtros.clienteId}
                onChange={(e) => aplicar({ cliente: e.target.value })}
              >
                <option value="">Todos os clientes</option>
                {opcoes.clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Categoria</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm mt-1"
                value={filtros.categoriaId}
                onChange={(e) => aplicar({ categoria: e.target.value })}
              >
                <option value="">Todas as categorias</option>
                {opcoes.categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Vendedor</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm mt-1"
                value={filtros.vendedorId}
                onChange={(e) => aplicar({ vendedor: e.target.value })}
              >
                <option value="">Todos os vendedores</option>
                {opcoes.vendedores.map((v) => (
                  <option key={v.id} value={v.id}>{v.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status</label>
              <select
                className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm mt-1"
                value={filtros.status}
                onChange={(e) => aplicar({ status: e.target.value })}
              >
                {STATUS_OPCOES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {filtrosAtivos.length > 0 && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap gap-1">
                {filtrosAtivos.map((f) => (
                  <Badge key={f} variant="secondary">{f}</Badge>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={limpar}>
                <X className="w-3 h-3" />Limpar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === KPIs === */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Vendas</p>
            <p className="text-2xl font-black mt-1 text-green-600">{brl(kpis.totalVendas)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Pedidos</p>
            <p className="text-2xl font-black mt-1">{kpis.totalPedidos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Itens vendidos</p>
            <p className="text-2xl font-black mt-1">{kpis.itensTotais}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Clientes únicos</p>
            <p className="text-2xl font-black mt-1 text-blue-600">{kpis.clientesUnicos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Ticket médio</p>
            <p className="text-xl font-black mt-1 text-purple-600">{brl(kpis.ticketMedio)}</p>
          </CardContent>
        </Card>
      </div>

      {/* === GRÁFICOS === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Vendas por dia</CardTitle>
          </CardHeader>
          <CardContent>
            {dados.vendasPorDia.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-12">Sem dados no período</p>
            ) : (
              <VendasChart data={dados.vendasPorDia.map((d: any) => ({ data: d.data, total: d.total }))} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {dados.vendasPorCategoria.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-12">Sem dados</p>
            ) : (
              <VendasCategoriaChart data={dados.vendasPorCategoria} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Vendas por cidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4" />Vendas por cidade
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dados.vendasPorCidade.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Sem dados</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {dados.vendasPorCidade.slice(0, 10).map((c: any, i: number) => (
                  <li key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        <span className="text-slate-400 mr-1">{i + 1}.</span>
                        {c.cidade}/{c.uf}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.clientesUnicos} cliente(s) · {c.pedidos} pedido(s)
                      </p>
                    </div>
                    <p className="font-bold text-green-600">{brl(c.total)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Vendas por vendedor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />Vendas por vendedor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dados.vendasPorVendedor.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Sem dados</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {dados.vendasPorVendedor.map((v: any, i: number) => (
                  <li key={i} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        <span className="text-slate-400 mr-1">{i + 1}.</span>
                        {v.nome}
                      </p>
                      <p className="text-xs text-slate-500">{v.pedidos} pedido(s)</p>
                    </div>
                    <p className="font-bold text-green-600">{brl(v.total)}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top clientes e Top produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />🏆 Top clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dados.topClientes.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Sem dados</p>
            ) : (
              <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                {dados.topClientes.map((c: any, i: number) => (
                  <li key={i} className="p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        <span className="text-slate-400 mr-1">{i + 1}.</span>
                        {c.nome}
                      </p>
                      <p className="text-xs text-slate-500">
                        {c.cidade} · {c.pedidos} pedido(s)
                      </p>
                    </div>
                    <p className="font-bold text-green-600 ml-2">{brl(c.total)}</p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="w-4 h-4" />📦 Top produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {dados.topProdutos.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Sem dados</p>
            ) : (
              <ol className="divide-y divide-slate-100 dark:divide-slate-800">
                {dados.topProdutos.map((p: any, i: number) => (
                  <li key={i} className="p-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        <span className="text-slate-400 mr-1">{i + 1}.</span>
                        {p.nome}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.categoria} · {p.quantidade} un
                      </p>
                    </div>
                    <p className="font-bold text-green-600 ml-2">{brl(p.receita)}</p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo por status */}
      {Object.keys(dados.mapaStatus).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Pedidos por status (no período)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {Object.entries(dados.mapaStatus).map(([s, count]) => (
                <div key={s} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                  <p className="text-xs text-slate-500">{STATUS_OPCOES.find(o => o.value === s)?.label || s}</p>
                  <p className="text-2xl font-black">{count as number}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

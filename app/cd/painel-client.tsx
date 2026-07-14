'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, Printer, Truck, Package, MapPin, ChevronRight, MoreVertical, CheckCircle2, PlayCircle, X, FileText, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { brl } from '../../lib/format';
import Link from 'next/link';
import { AcoesPedido } from '../../components/acoes-pedido';

type Pedido = {
  id: string;
  numero: number;
  data: string;
  total: number;
  status: string;
  condicaoPgto: string | null;
  observacoes: string | null;
  cliente: {
    nome: string;
    cidade: string | null;
    estado: string | null;
  };
  _count: { itens: number };
};

export default function PainelClient({
  pedidos: pedidosIniciais,
}: {
  pedidos: Pedido[];
}) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [filtro, setFiltro] = useState<string>('PENDENTES');
  const [cidadeFiltro, setCidadeFiltro] = useState<string>('');

  // Stats
  const stats = {
    pendentes: pedidos.filter((p) => p.status === 'ENVIADO').length,
    separando: pedidos.filter((p) => p.status === 'EM_SEPARACAO').length,
    despachados: pedidos.filter((p) => p.status === 'DESPACHADO').length,
    entregues: pedidos.filter((p) => p.status === 'ENTREGUE').length,
    total: pedidos.filter((p) => ['ENVIADO', 'EM_SEPARACAO'].includes(p.status)).reduce((s, p) => s + p.total, 0),
  };

  // Filtro
  let filtrados = pedidos;
  if (filtro === 'PENDENTES') filtrados = pedidos.filter((p) => ['ENVIADO', 'EM_SEPARACAO'].includes(p.status));
  else if (filtro === 'ENVIADO') filtrados = pedidos.filter((p) => p.status === 'ENVIADO');
  else if (filtro === 'EM_SEPARACAO') filtrados = pedidos.filter((p) => p.status === 'EM_SEPARACAO');
  else if (filtro === 'DESPACHADO') filtrados = pedidos.filter((p) => p.status === 'DESPACHADO');
  else if (filtro === 'ENTREGUE') filtrados = pedidos.filter((p) => p.status === 'ENTREGUE');

  if (cidadeFiltro) filtrados = filtrados.filter((p) => `${p.cliente.cidade}/${p.cliente.estado}` === cidadeFiltro);

  // Agrupa por cidade
  const porCidade = new Map<string, Pedido[]>();
  for (const p of filtrados) {
    const chave = `${p.cliente.cidade || '?'}/${p.cliente.estado || '?'}`;
    if (!porCidade.has(chave)) porCidade.set(chave, []);
    porCidade.get(chave)!.push(p);
  }

  const cidades = Array.from(new Set(pedidos.map((p) => `${p.cliente.cidade || '?'}/${p.cliente.estado || '?'}`)));

  function onStatusMudou(pedidoId: string, novoStatus: string) {
    setPedidos((ps) => ps.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p)));
  }

  const TABS = [
    { key: 'PENDENTES', label: 'Pendentes', count: stats.pendentes + stats.separando, color: 'amber' },
    { key: 'ENVIADO', label: 'Novos', count: stats.pendentes, color: 'blue' },
    { key: 'EM_SEPARACAO', label: 'Separando', count: stats.separando, color: 'yellow' },
    { key: 'DESPACHADO', label: 'Despachados', count: stats.despachados, color: 'purple' },
    { key: 'ENTREGUE', label: 'Entregues', count: stats.entregues, color: 'green' },
    { key: 'TODOS', label: 'Todos', count: pedidos.length, color: 'slate' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">A separar</p>
                <p className="text-2xl font-black mt-1 text-amber-600">{stats.pendentes}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Em separação</p>
                <p className="text-2xl font-black mt-1 text-yellow-600">{stats.separando}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">Despachados</p>
                <p className="text-2xl font-black mt-1 text-purple-600">{stats.despachados}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Truck className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-xs text-slate-500">A receber hoje</p>
              <p className="text-xl font-black mt-1 text-green-600">{brl(stats.total)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-3">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setFiltro(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                  filtro === t.key
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t.label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filtro === t.key ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                }`}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>
          {cidades.length > 1 && (
            <div className="flex gap-1 overflow-x-auto pt-2 border-t border-slate-200 dark:border-slate-800 mt-2">
              <button
                onClick={() => setCidadeFiltro('')}
                className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  !cidadeFiltro
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                Todas as cidades
              </button>
              {cidades.map((c) => (
                <button
                  key={c}
                  onClick={() => setCidadeFiltro(c)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                    cidadeFiltro === c
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  📍 {c}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista agrupada por cidade */}
      {porCidade.size === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto text-green-300 mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-semibold">
              {filtro === 'PENDENTES' ? 'Nenhum pedido pendente' : 'Nada por aqui'}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {filtro === 'PENDENTES' && 'Todos os pedidos estão despachados ou entregues. Tá em dia! 🎉'}
            </p>
          </CardContent>
        </Card>
      ) : (
        Array.from(porCidade.entries()).map(([cidade, lista]) => {
          const totalCidade = lista.reduce((s, p) => s + p.total, 0);
          return (
            <Card key={cidade} className="overflow-hidden">
              <div className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-800 dark:to-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <h3 className="font-bold">{cidade}</h3>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="opacity-80">{lista.length} pedido{lista.length > 1 ? 's' : ''}</span>
                  <span className="font-bold">{brl(totalCidade)}</span>
                </div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lista.map((p) => (
                    <div key={p.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 shrink-0">
                            #{p.numero}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{p.cliente.nome}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                              <span>📅 {new Date(p.data).toLocaleDateString('pt-BR')}</span>
                              <span>📦 {p._count.itens} {p._count.itens === 1 ? 'item' : 'itens'}</span>
                              {p.condicaoPgto && <span>💳 {p.condicaoPgto}</span>}
                            </div>
                            {p.observacoes && (
                              <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 italic bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                                📝 {p.observacoes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-lg text-slate-900 dark:text-slate-100">{brl(p.total)}</p>
                          <StatusBadge status={p.status} />
                        </div>
                      </div>

                      {/* Ações inline */}
                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/pedidos/${p.id}`}><Eye className="w-3.5 h-3.5" />Ver detalhes</Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/pedidos/${p.id}/imprimir`} target="_blank">
                            <Printer className="w-3.5 h-3.5" />Imprimir
                          </Link>
                        </Button>
                        <AcoesPedido
                          pedidoId={p.id}
                          statusAtual={p.status}
                          onMudou={(novo) => onStatusMudou(p.id, novo)}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any; icon: any }> = {
    RASCUNHO: { label: 'Rascunho', variant: 'secondary', icon: FileText },
    ENVIADO: { label: 'Aguardando', variant: 'info', icon: Send },
    EM_SEPARACAO: { label: 'Separando', variant: 'warning', icon: PlayCircle },
    DESPACHADO: { label: 'Despachado', variant: 'info', icon: Truck },
    ENTREGUE: { label: 'Entregue', variant: 'success', icon: CheckCircle2 },
    CANCELADO: { label: 'Cancelado', variant: 'danger', icon: X },
  };
  const s = map[status] || { label: status, variant: 'secondary', icon: Package };
  const Icon = s.icon;
  return (
    <Badge variant={s.variant} className="mt-1 gap-1">
      <Icon className="w-3 h-3" />
      {s.label}
    </Badge>
  );
}

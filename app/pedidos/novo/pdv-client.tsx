'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Search, Plus, Minus, X, ShoppingCart, ArrowLeft, Send, Save,
  User, MapPin, Package, SearchX, Check, ChevronRight, Pencil,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Label } from '../../../components/ui/label';
import { useOnline } from '../../../lib/use-online';
import { cn } from '../../../lib/utils';
import { IconePorNome } from '../../../components/categoria-dialog';

type Cliente = {
  id: string;
  nome: string;
  nomeFantasia: string | null;
  cidade: string | null;
  estado: string | null;
  condicaoPgto: string | null;
};

type Produto = {
  id: number;
  nome: string;
  unidade: string;
  precoTabela: number;
  categoria: { id: number; nome: string; cor: string | null; icone: string | null };
  estoque: number;
  foto: string | null;
  destaque: boolean;
};

type Item = {
  produtoId: number;
  nome: string;
  unidade: string;
  precoUnit: number;
  quantidade: number;
  observacao: string;
};

export default function PDVClient({
  clientes,
  produtos,
  categorias,
  vendedorId,
  clienteInicial,
}: {
  clientes: Cliente[];
  produtos: Produto[];
  categorias: { id: number; nome: string; cor: string | null; icone: string | null }[];
  vendedorId: string;
  clienteInicial?: Cliente;
}) {
  const router = useRouter();
  const { online, adicionar, pendentes } = useOnline();
  const [cliente, setCliente] = useState<Cliente | null>(clienteInicial || null);
  const [buscaCliente, setBuscaCliente] = useState('');
  const [itens, setItens] = useState<Item[]>([]);
  const [buscaProd, setBuscaProd] = useState('');
  const [condicaoPgto, setCondicaoPgto] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [desconto, setDesconto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [itemEditando, setItemEditando] = useState<{ idx: number } | null>(null);

  const clientesFiltrados = useMemo(() => {
    if (!buscaCliente) return clientes.slice(0, 8);
    const b = buscaCliente.toLowerCase();
    return clientes
      .filter(
        (c) =>
          c.nome.toLowerCase().includes(b) ||
          (c.nomeFantasia?.toLowerCase().includes(b) ?? false) ||
          (c.cidade?.toLowerCase().includes(b) ?? false)
      )
      .slice(0, 8);
  }, [buscaCliente, clientes]);

  const produtosFiltrados = useMemo(() => {
    if (!buscaProd.trim()) return [];
    const b = buscaProd.toLowerCase();
    return produtos
      .filter((p) => p.nome.toLowerCase().includes(b) || p.categoria.nome.toLowerCase().includes(b))
      .sort((a, b) => Number(b.destaque) - Number(a.destaque))
      .slice(0, 30);
  }, [buscaProd, produtos]);

  function adicionarProduto(p: Produto, quantidade: number = 1, precoCustom?: number) {
    const idx = itens.findIndex((i) => i.produtoId === p.id);
    if (idx >= 0) {
      const novo = [...itens];
      novo[idx] = { ...novo[idx], quantidade: novo[idx].quantidade + quantidade, precoUnit: precoCustom ?? novo[idx].precoUnit };
      setItens(novo);
    } else {
      setItens([
        ...itens,
        {
          produtoId: p.id,
          nome: p.nome,
          unidade: p.unidade,
          precoUnit: precoCustom ?? p.precoTabela,
          quantidade,
          observacao: '',
        },
      ]);
    }
  }

  function removerItem(idx: number) {
    setItens(itens.filter((_, i) => i !== idx));
  }

  function atualizarItem(idx: number, patch: Partial<Item>) {
    const novo = [...itens];
    novo[idx] = { ...novo[idx], ...patch };
    setItens(novo);
  }

  const subtotal = itens.reduce((s, i) => s + i.quantidade * i.precoUnit, 0);
  const descValor = parseFloat(desconto.replace(',', '.')) || 0;
  const total = Math.max(0, subtotal - descValor);

  async function enviar(statusFinal: 'RASCUNHO' | 'ENVIADO') {
    if (!cliente) { toast.error('Selecione um cliente'); return; }
    if (itens.length === 0) { toast.error('Adicione pelo menos 1 produto'); return; }
    setEnviando(true);
    try {
      if (!navigator.onLine) {
        await adicionar({
          id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          clienteId: cliente.id,
          clienteNome: cliente.nome,
          vendedorId,
          condicaoPgto: condicaoPgto || cliente.condicaoPgto || null,
          observacoes: observacoes || null,
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            produtoNome: i.nome,
            quantidade: i.quantidade,
            precoUnit: i.precoUnit,
            observacao: i.observacao || null,
          })),
          total,
          criadoEm: new Date().toISOString(),
          status: statusFinal,
        });
        toast.success('📴 Pedido salvo OFFLINE', { description: 'Será enviado quando voltar o sinal' });
        router.push('/pedidos');
        return;
      }
      const r = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: cliente.id,
          vendedorId,
          condicaoPgto: condicaoPgto || cliente.condicaoPgto || null,
          observacoes: observacoes || null,
          desconto: descValor,
          status: statusFinal,
          itens: itens.map((i) => ({
            produtoId: i.produtoId,
            quantidade: i.quantidade,
            precoUnit: i.precoUnit,
            observacao: i.observacao || null,
          })),
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        toast.error('Erro', { description: d.error });
        return;
      }
      const { id } = await r.json();
      toast.success(statusFinal === 'ENVIADO' ? '✅ Pedido enviado!' : 'Rascunho salvo');
      router.push(`/pedidos/${id}`);
      router.refresh();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20">
        <div className="px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon">
              <Link href="/"><ArrowLeft className="w-5 h-5" /></Link>
            </Button>
            <div>
              <h1 className="text-base sm:text-lg font-black">Novo Pedido</h1>
              <p className="text-[10px] sm:text-xs text-slate-500">
                {online ? <span className="text-green-600">● Online</span> : <span className="text-amber-600">● Offline</span>}
                {pendentes > 0 && ` · ${pendentes} pendente(s)`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
            <p className="text-lg sm:text-xl font-black text-green-600">R$ {total.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-3 sm:p-4 space-y-3">
        {/* === 1. Cliente === */}
        <Card className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">1</span>
              Cliente
            </h2>
            {cliente && (
              <button onClick={() => setCliente(null)} className="text-xs text-blue-600 hover:underline">
                trocar
              </button>
            )}
          </div>
          {cliente ? (
            <div className="flex items-center gap-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/40">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{cliente.nome}</p>
                {cliente.cidade && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{cliente.cidade}/{cliente.estado}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                placeholder="Buscar cliente por nome ou cidade..."
                className="pl-10 h-11"
                autoFocus
              />
              {buscaCliente && (
                <ul className="mt-2 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 -mx-1 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                  {clientesFiltrados.length === 0 ? (
                    <li className="p-3 text-center text-sm text-slate-500">Nenhum cliente encontrado</li>
                  ) : (
                    clientesFiltrados.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setCliente(c);
                            setBuscaCliente('');
                            if (c.condicaoPgto && !condicaoPgto) setCondicaoPgto(c.condicaoPgto);
                          }}
                          className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{c.nome}</p>
                            <p className="text-xs text-slate-500">{c.cidade}/{c.estado}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}
        </Card>

        {/* === 2. Produtos (lançador) === */}
        <Card className="p-3">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">2</span>
            Lançar produtos
            {itens.length > 0 && <Badge variant="info" className="ml-1">{itens.length}</Badge>}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={buscaProd}
              onChange={(e) => setBuscaProd(e.target.value)}
              placeholder="🔍 Digite o nome do produto para buscar..."
              className="pl-10 h-12 text-base"
            />
            {buscaProd && (
              <button
                onClick={() => setBuscaProd('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Resultados da busca */}
          {buscaProd && (
            <div className="mt-2 max-h-72 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {produtosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  <SearchX className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Nenhum produto encontrado
                </div>
              ) : (
                produtosFiltrados.map((p) => {
                  const semEstoque = p.estoque === 0;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => !semEstoque && adicionarProduto(p)}
                      disabled={semEstoque}
                      className={cn(
                        'w-full text-left p-3 flex items-center gap-3 transition-colors',
                        semEstoque ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                      )}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: (p.categoria.cor || '#64748b') + '20' }}
                      >
                        <IconePorNome nome={p.categoria.icone} className="w-4 h-4" cor={p.categoria.cor || '#64748b'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{p.nome}</p>
                        <p className="text-xs text-slate-500">
                          {p.categoria.nome} · {p.unidade} · {p.estoque} em estoque
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-green-600 text-sm">R$ {p.precoTabela.toFixed(2).replace('.', ',')}</p>
                        {p.destaque && <span className="text-[10px] text-amber-600">⭐ destaque</span>}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <Plus className="w-4 h-4" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Dica quando não tem busca */}
          {!buscaProd && (
            <div className="mt-2 p-4 text-center text-sm text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Digite o nome do produto acima para começar a lançar</p>
              <p className="text-xs mt-1">Ex: "Brigadeiro", "Saco", "Seda", "Sabiá"...</p>
            </div>
          )}
        </Card>

        {/* === 3. Itens lançados === */}
        {itens.length > 0 && (
          <Card className="p-3">
            <h2 className="font-bold text-sm flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">3</span>
              Itens lançados
              <Badge variant="info">{itens.length}</Badge>
              <button
                onClick={() => setItens([])}
                className="ml-auto text-xs text-red-600 hover:underline"
              >
                limpar tudo
              </button>
            </h2>
            <ul className="space-y-1.5">
              {itens.map((item, idx) => (
                <li
                  key={item.produtoId}
                  className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{item.nome}</p>
                    <p className="text-xs text-slate-500">{item.unidade} · R$ {(item.quantidade * item.precoUnit).toFixed(2).replace('.', ',')}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => {
                          if (item.quantidade <= 1) {
                            removerItem(idx);
                          } else {
                            atualizarItem(idx, { quantidade: item.quantidade - 1 });
                          }
                        }}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-l"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 h-7 flex items-center justify-center text-sm font-bold">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() => atualizarItem(idx, { quantidade: item.quantidade + 1 })}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-r"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => setItemEditando({ idx })}
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                      title="Editar preço/observação"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removerItem(idx)}
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* === 4. Condições e ação === */}
        {itens.length > 0 && (
          <Card className="p-3 space-y-2">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">4</span>
              Condições
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Desconto</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Cond. Pgto</Label>
                <Input
                  value={condicaoPgto}
                  onChange={(e) => setCondicaoPgto(e.target.value)}
                  placeholder="Boleto 30 dias"
                />
              </div>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Mandar 01 Doce Leite..."
                rows={2}
              />
            </div>
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-semibold">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {descValor > 0 && (
                <div className="flex justify-between text-sm text-red-600">
                  <span>Desconto</span>
                  <span className="font-mono font-semibold">− R$ {descValor.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1 border-t-2 border-slate-900 dark:border-slate-100">
                <span className="text-base font-black uppercase">Total</span>
                <span className="text-3xl font-black text-green-600 font-mono">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" onClick={() => enviar('RASCUNHO')} disabled={enviando || !cliente}>
                <Save className="w-4 h-4" />Rascunho
              </Button>
              <Button variant="accent" onClick={() => enviar('ENVIADO')} disabled={enviando || !cliente}>
                <Send className="w-4 h-4" />
                {enviando ? 'Enviando...' : 'Enviar pedido'}
              </Button>
            </div>
            {!cliente && (
              <p className="text-xs text-amber-600 text-center">
                ⚠️ Selecione um cliente antes de salvar/enviar
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Dialog de edição de item */}
      {itemEditando && (
        <ItemEditDialog
          item={itens[itemEditando.idx]}
          onClose={() => setItemEditando(null)}
          onSave={(patch) => {
            atualizarItem(itemEditando.idx, patch);
            setItemEditando(null);
          }}
        />
      )}
    </div>
  );
}

function ItemEditDialog({
  item,
  onClose,
  onSave,
}: {
  item: Item;
  onClose: () => void;
  onSave: (patch: Partial<Item>) => void;
}) {
  const [preco, setPreco] = useState(String(item.precoUnit));
  const [qtd, setQtd] = useState(String(item.quantidade));
  const [obs, setObs] = useState(item.observacao);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.nome}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                step="1"
                min="0"
                value={qtd}
                onChange={(e) => setQtd(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <Label>Preço unitário</Label>
              <Input
                type="number"
                step="0.01"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Observação do item</Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              rows={2}
              placeholder="Ex: Caixa lacrada, marca diferente..."
            />
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-sm">
            <p className="text-xs text-slate-500">Total do item</p>
            <p className="text-2xl font-black text-green-600">
              R$ {((parseFloat(qtd) || 0) * (parseFloat(preco) || 0)).toFixed(2).replace('.', ',')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button
              variant="accent"
              onClick={() => onSave({
                quantidade: parseFloat(qtd) || 0,
                precoUnit: parseFloat(preco) || 0,
                observacao: obs,
              })}
              className="flex-1"
            >
              <Check className="w-4 h-4" />Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

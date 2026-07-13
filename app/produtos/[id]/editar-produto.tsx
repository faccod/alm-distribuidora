'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Trash2, ImageIcon, X, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import Link from 'next/link';
import { CategoriaDialog, IconePorNome } from '../../../components/categoria-dialog';
import { MarcaDialog } from '../../../components/marca-dialog';

type Produto = {
  id: number;
  nome: string;
  descricao: string | null;
  sku: string | null;
  codigoBarras: string | null;
  categoriaId: number;
  marcaId: number | null;
  unidade: string;
  unidadesPorEmbalagem: number | null;
  precoCusto: number;
  precoTabela: number;
  precoPromocional: number | null;
  estoque: number;
  estoqueMinimo: number;
  destaque: boolean;
  ativo: boolean;
  foto: string | null;
};

export default function EditarProduto({
  produto,
  categorias: catsIniciais,
  marcas: marcasIniciais,
}: {
  produto: Produto;
  categorias: { id: number; nome: string; icone: string | null; cor: string | null }[];
  marcas: { id: number; nome: string }[];
}) {
  const router = useRouter();
  const [categorias, setCategorias] = useState(catsIniciais);
  const [marcas, setMarcas] = useState(marcasIniciais);
  const [form, setForm] = useState({
    nome: produto.nome,
    descricao: produto.descricao || '',
    sku: produto.sku || '',
    codigoBarras: produto.codigoBarras || '',
    categoriaId: String(produto.categoriaId),
    marcaId: produto.marcaId ? String(produto.marcaId) : '',
    unidade: produto.unidade,
    unidadesPorEmbalagem: produto.unidadesPorEmbalagem ? String(produto.unidadesPorEmbalagem) : '',
    precoCusto: String(produto.precoCusto),
    precoTabela: String(produto.precoTabela),
    precoPromocional: produto.precoPromocional ? String(produto.precoPromocional) : '',
    estoque: String(produto.estoque),
    estoqueMinimo: String(produto.estoqueMinimo),
    destaque: produto.destaque,
    ativo: produto.ativo,
    foto: produto.foto || '',
  });
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  function upd(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadFoto(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    if (r.ok) {
      const d = await r.json();
      upd('foto', d.url);
      toast.success('Foto atualizada');
    } else {
      toast.error('Erro ao enviar foto');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.categoriaId) {
      toast.error('Preencha nome e categoria');
      return;
    }
    setSalvando(true);
    try {
      const r = await fetch(`/api/produtos/${produto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          descricao: form.descricao || null,
          sku: form.sku || null,
          codigoBarras: form.codigoBarras || null,
          categoriaId: parseInt(form.categoriaId),
          marcaId: form.marcaId ? parseInt(form.marcaId) : null,
          unidade: form.unidade,
          unidadesPorEmbalagem: form.unidadesPorEmbalagem ? parseInt(form.unidadesPorEmbalagem) : null,
          precoCusto: parseFloat(form.precoCusto.replace(',', '.')) || 0,
          precoTabela: parseFloat(form.precoTabela.replace(',', '.')) || 0,
          precoPromocional: form.precoPromocional ? parseFloat(form.precoPromocional.replace(',', '.')) : null,
          estoque: parseInt(form.estoque) || 0,
          estoqueMinimo: parseInt(form.estoqueMinimo) || 0,
          destaque: form.destaque,
          ativo: form.ativo,
          foto: form.foto || null,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        toast.error('Erro', { description: d.error });
        return;
      }
      toast.success('Produto atualizado!');
      router.push('/produtos');
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!confirm('Excluir este produto? Os pedidos antigos manterão o histórico.')) return;
    setExcluindo(true);
    try {
      const r = await fetch(`/api/produtos/${produto.id}`, { method: 'DELETE' });
      if (r.ok) {
        toast.success('Produto excluído');
        router.push('/produtos');
        router.refresh();
      } else {
        toast.error('Erro ao excluir');
      }
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/produtos"><ArrowLeft className="w-4 h-4" />Voltar</Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={excluir} disabled={excluindo}>
          <Trash2 className="w-4 h-4" />Excluir
        </Button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Foto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto do produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800">
                {form.foto ? (
                  <img src={form.foto} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadFoto(e.target.files[0])}
                    className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white"
                  />
                </label>
                {form.foto && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => upd('foto', '')}>
                    <X className="w-3 h-3" />Remover foto
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identificação */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Nome do produto *</Label>
              <Input value={form.nome} onChange={(e) => upd('nome', e.target.value)} required />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => upd('descricao', e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>SKU</Label>
                <Input value={form.sku} onChange={(e) => upd('sku', e.target.value)} />
              </div>
              <div>
                <Label>Código de barras</Label>
                <Input value={form.codigoBarras} onChange={(e) => upd('codigoBarras', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categoria/Marca/Unidade */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Classificação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Categoria *</Label>
                <CategoriaDialog
                  onCriada={(cat) => {
                    setCategorias((cs) => [...cs, cat].sort((a, b) => a.nome.localeCompare(b.nome)));
                    upd('categoriaId', String(cat.id));
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                {form.categoriaId && (() => {
                  const cat = categorias.find((c) => String(c.id) === form.categoriaId);
                  if (!cat) return null;
                  return (
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: (cat.cor || '#64748b') + '20' }}
                    >
                      <IconePorNome nome={cat.icone} className="w-5 h-5" cor={cat.cor || '#64748b'} />
                    </div>
                  );
                })()}
                <Select value={form.categoriaId} onChange={(e) => upd('categoriaId', e.target.value)} required className="flex-1">
                  <option value="">Selecione...</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Marca / Fabricante</Label>
                <MarcaDialog
                  onCriada={(marca) => {
                    setMarcas((ms) => [...ms, marca].sort((a, b) => a.nome.localeCompare(b.nome)));
                    upd('marcaId', String(marca.id));
                  }}
                />
              </div>
              <Select value={form.marcaId} onChange={(e) => upd('marcaId', e.target.value)}>
                <option value="">Selecione...</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Unidade</Label>
                <Select value={form.unidade} onChange={(e) => upd('unidade', e.target.value)}>
                  <option value="UN">UN</option>
                  <option value="CX">CX</option>
                  <option value="PCT">PCT</option>
                  <option value="RL">RL</option>
                  <option value="KG">KG</option>
                  <option value="LT">LT</option>
                </Select>
              </div>
              <div>
                <Label>Unid. por embalagem</Label>
                <Input type="number" value={form.unidadesPorEmbalagem} onChange={(e) => upd('unidadesPorEmbalagem', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preços */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Custo</Label>
                <Input type="number" step="0.01" value={form.precoCusto} onChange={(e) => upd('precoCusto', e.target.value)} />
              </div>
              <div>
                <Label>Venda</Label>
                <Input type="number" step="0.01" value={form.precoTabela} onChange={(e) => upd('precoTabela', e.target.value)} />
              </div>
              <div>
                <Label>Promocional</Label>
                <Input type="number" step="0.01" value={form.precoPromocional} onChange={(e) => upd('precoPromocional', e.target.value)} />
              </div>
            </div>
            {form.precoCusto && form.precoTabela && parseFloat(form.precoCusto) > 0 && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40">
                <p className="text-sm text-green-700 dark:text-green-300">
                  💰 Margem: <b>
                    {(((parseFloat(form.precoTabela) - parseFloat(form.precoCusto)) /
                      parseFloat(form.precoCusto)) * 100).toFixed(1)}%
                  </b>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estoque */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Estoque atual</Label>
                <Input type="number" value={form.estoque} onChange={(e) => upd('estoque', e.target.value)} />
              </div>
              <div>
                <Label>Estoque mínimo</Label>
                <Input type="number" value={form.estoqueMinimo} onChange={(e) => upd('estoqueMinimo', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.destaque} onChange={(e) => upd('destaque', e.target.checked)} className="w-4 h-4 rounded" />
            ⭐ Destaque
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.ativo} onChange={(e) => upd('ativo', e.target.checked)} className="w-4 h-4 rounded" />
            Ativo
          </label>
        </div>

        <div className="flex gap-2 sticky bottom-0 bg-slate-50 dark:bg-slate-950 py-3">
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href="/produtos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={salvando} className="flex-1">
            <Save className="w-4 h-4" />
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
}

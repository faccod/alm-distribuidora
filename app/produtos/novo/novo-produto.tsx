'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, ImageIcon, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import ThemeBackButton from '../../../components/theme-back-button';
import { CategoriaDialog, IconePorNome } from '../../../components/categoria-dialog';
import { MarcaDialog } from '../../../components/marca-dialog';

export default function NovoProduto({
  categorias: catsIniciais,
  marcas: marcasIniciais,
}: {
  categorias: { id: number; nome: string; icone: string | null; cor: string | null }[];
  marcas: { id: number; nome: string }[];
}) {
  const router = useRouter();
  const [categorias, setCategorias] = useState(catsIniciais);
  const [marcas, setMarcas] = useState(marcasIniciais);
  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    sku: '',
    codigoBarras: '',
    categoriaId: '',
    marcaId: '',
    unidade: 'UN',
    unidadesPorEmbalagem: '',
    precoCusto: '',
    precoTabela: '',
    precoPromocional: '',
    estoque: '0',
    estoqueMinimo: '0',
    destaque: false,
    foto: '',
  });
  const [salvando, setSalvando] = useState(false);

  function upd(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadFoto(file: File) {
    try {
      const { uploadFile } = await import('../../../lib/upload');
      const d = await uploadFile(file);
      upd('foto', d.url);
      toast.success('Foto enviada');
    } catch (e: any) {
      toast.error('Erro ao enviar foto: ' + (e?.message || ''));
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
      const r = await fetch('/api/produtos', {
        method: 'POST',
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
          foto: form.foto || null,
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        toast.error('Erro', { description: d.error });
        return;
      }
      toast.success('Produto cadastrado!');
      router.push('/produtos');
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ThemeBackButton href="/produtos" />
            <h1 className="text-lg font-bold">Novo produto</h1>
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="max-w-3xl mx-auto p-4 space-y-4 animate-fade-in">
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
                    className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  />
                </label>
                <p className="text-xs text-slate-500">PNG, JPG até 5MB</p>
                {form.foto && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => upd('foto', '')}>
                    <X className="w-3 h-3" /> Remover foto
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
              <Input
                value={form.nome}
                onChange={(e) => upd('nome', e.target.value)}
                placeholder="Ex: Cigarro Tchau Brigadeiro Ice"
                required
                autoFocus
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea
                value={form.descricao}
                onChange={(e) => upd('descricao', e.target.value)}
                placeholder="Detalhes, observações, marca..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>SKU (código interno)</Label>
                <Input value={form.sku} onChange={(e) => upd('sku', e.target.value)} placeholder="ALM-001" />
              </div>
              <div>
                <Label>Código de barras</Label>
                <Input
                  value={form.codigoBarras}
                  onChange={(e) => upd('codigoBarras', e.target.value)}
                  placeholder="7891234567890"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categoria e marca */}
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
                    // Adiciona à lista local
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
              <p className="text-xs text-slate-500 mt-1">
                Não encontrou? Clique em <b>Nova categoria</b> acima pra criar.
              </p>
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
                <Label>Unidade de venda</Label>
                <Select value={form.unidade} onChange={(e) => upd('unidade', e.target.value)}>
                  <option value="UN">UN (unidade)</option>
                  <option value="CX">CX (caixa)</option>
                  <option value="PCT">PCT (pacote)</option>
                  <option value="RL">RL (rolo)</option>
                  <option value="KG">KG (quilo)</option>
                  <option value="LT">LT (litro)</option>
                </Select>
              </div>
              <div>
                <Label>Unid. por embalagem</Label>
                <Input
                  type="number"
                  min="1"
                  value={form.unidadesPorEmbalagem}
                  onChange={(e) => upd('unidadesPorEmbalagem', e.target.value)}
                  placeholder="Ex: 20"
                />
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
                <Input
                  type="number"
                  step="0.01"
                  value={form.precoCusto}
                  onChange={(e) => upd('precoCusto', e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Venda</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.precoTabela}
                  onChange={(e) => upd('precoTabela', e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Promocional</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.precoPromocional}
                  onChange={(e) => upd('precoPromocional', e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
            {form.precoCusto && form.precoTabela && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40">
                <p className="text-sm text-green-700 dark:text-green-300">
                  💰 Margem:{' '}
                  <b>
                    {(
                      ((parseFloat(form.precoTabela.replace(',', '.')) -
                        parseFloat(form.precoCusto.replace(',', '.'))) /
                        parseFloat(form.precoCusto.replace(',', '.'))) *
                      100
                    ).toFixed(1)}
                    %
                  </b>{' '}
                  (
                  {(
                    parseFloat(form.precoTabela.replace(',', '.')) -
                    parseFloat(form.precoCusto.replace(',', '.'))
                  ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}{' '}
                  por unidade)
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
                <Input
                  type="number"
                  value={form.estoque}
                  onChange={(e) => upd('estoque', e.target.value)}
                />
              </div>
              <div>
                <Label>Estoque mínimo (alerta)</Label>
                <Input
                  type="number"
                  value={form.estoqueMinimo}
                  onChange={(e) => upd('estoqueMinimo', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="destaque"
            checked={form.destaque}
            onChange={(e) => upd('destaque', e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="destaque" className="text-sm font-medium">
            ⭐ Marcar como destaque (aparece primeiro)
          </label>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.push('/produtos')} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" disabled={salvando} className="flex-1">
            <Save className="w-4 h-4" />
            {salvando ? 'Salvando...' : 'Cadastrar'}
          </Button>
        </div>
      </form>
    </div>
  );
}

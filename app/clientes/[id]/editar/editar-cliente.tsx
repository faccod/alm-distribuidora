'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Trash2, Plus, ImageIcon, X, ArrowLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { Textarea } from '../../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import Link from 'next/link';

type Contato = { nome: string; cargo: string; telefone: string; email: string };

type Cliente = {
  id: string;
  nome: string;
  nomeFantasia: string | null;
  tipo: string;
  cpfCnpj: string | null;
  inscricaoEstadual: string | null;
  email: string | null;
  site: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  limiteCredito: number;
  condicaoPgto: string | null;
  dadosBancarios: string | null;
  statusFinanc: string;
  tags: string | null;
  observacoes: string | null;
  foto: string | null;
  ativo: boolean;
  contatos: Contato[];
};

export default function EditarCliente({ cliente }: { cliente: Cliente }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: cliente.nome,
    nomeFantasia: cliente.nomeFantasia || '',
    tipo: cliente.tipo,
    cpfCnpj: cliente.cpfCnpj || '',
    inscricaoEstadual: cliente.inscricaoEstadual || '',
    email: cliente.email || '',
    site: cliente.site || '',
    cep: cliente.cep || '',
    endereco: cliente.endereco || '',
    numero: cliente.numero || '',
    complemento: cliente.complemento || '',
    bairro: cliente.bairro || '',
    cidade: cliente.cidade || '',
    estado: cliente.estado || '',
    limiteCredito: String(cliente.limiteCredito),
    condicaoPgto: cliente.condicaoPgto || 'Boleto 30 dias',
    dadosBancarios: cliente.dadosBancarios || '',
    statusFinanc: cliente.statusFinanc,
    tags: cliente.tags || '',
    observacoes: cliente.observacoes || '',
    foto: cliente.foto || '',
    ativo: cliente.ativo,
  });
  const [contatos, setContatos] = useState<Contato[]>(cliente.contatos);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  function upd(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function updContato(i: number, k: keyof Contato, v: string) {
    setContatos((c) => c.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  }

  async function uploadFoto(file: File) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    if (r.ok) {
      const d = await r.json();
      upd('foto', d.url);
      toast.success('Logo atualizado');
    } else {
      toast.error('Erro ao enviar logo');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome) {
      toast.error('Nome é obrigatório');
      return;
    }
    setSalvando(true);
    try {
      const r = await fetch(`/api/clientes/${cliente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          limiteCredito: parseFloat(form.limiteCredito.replace(',', '.')) || 0,
          contatos: JSON.stringify(contatos.filter((c) => c.nome || c.telefone)),
        }),
      });
      if (!r.ok) {
        const d = await r.json();
        toast.error('Erro', { description: d.error });
        return;
      }
      toast.success('Cliente atualizado!');
      router.push(`/clientes/${cliente.id}`);
      router.refresh();
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!confirm('Excluir este cliente? O histórico de pedidos será mantido.')) return;
    setExcluindo(true);
    try {
      const r = await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' });
      if (r.ok) {
        toast.success('Cliente excluído');
        router.push('/clientes');
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
          <Link href={`/clientes/${cliente.id}`}><ArrowLeft className="w-4 h-4" />Voltar</Link>
        </Button>
        <Button variant="destructive" size="sm" onClick={excluir} disabled={excluindo}>
          <Trash2 className="w-4 h-4" />Excluir
        </Button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Logo */}
        <Card>
          <CardHeader><CardTitle className="text-base">Logo / Foto</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800">
                {form.foto ? (
                  <img src={form.foto} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && uploadFoto(e.target.files[0])}
                    className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identificação */}
        <Card>
          <CardHeader><CardTitle className="text-base">Identificação</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Nome / Razão Social *</Label>
              <Input value={form.nome} onChange={(e) => upd('nome', e.target.value)} required />
            </div>
            <div>
              <Label>Nome fantasia</Label>
              <Input value={form.nomeFantasia} onChange={(e) => upd('nomeFantasia', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onChange={(e) => upd('tipo', e.target.value)}>
                  <option value="PESSOA_JURIDICA">Pessoa Jurídica</option>
                  <option value="PESSOA_FISICA">Pessoa Física</option>
                </Select>
              </div>
              <div>
                <Label>{form.tipo === 'PESSOA_FISICA' ? 'CPF' : 'CNPJ'}</Label>
                <Input value={form.cpfCnpj} onChange={(e) => upd('cpfCnpj', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Inscrição Estadual</Label>
              <Input value={form.inscricaoEstadual} onChange={(e) => upd('inscricaoEstadual', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => upd('email', e.target.value)} />
              </div>
              <div>
                <Label>Site</Label>
                <Input value={form.site} onChange={(e) => upd('site', e.target.value)} placeholder="https://" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card>
          <CardHeader><CardTitle className="text-base">Endereço</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div><Label>CEP</Label><Input value={form.cep} onChange={(e) => upd('cep', e.target.value)} /></div>
              <div className="col-span-2"><Label>Endereço</Label><Input value={form.endereco} onChange={(e) => upd('endereco', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Número</Label><Input value={form.numero} onChange={(e) => upd('numero', e.target.value)} /></div>
              <div className="col-span-2"><Label>Complemento</Label><Input value={form.complemento} onChange={(e) => upd('complemento', e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Bairro</Label><Input value={form.bairro} onChange={(e) => upd('bairro', e.target.value)} /></div>
              <div><Label>Cidade</Label><Input value={form.cidade} onChange={(e) => upd('cidade', e.target.value)} /></div>
              <div>
                <Label>UF</Label>
                <Input value={form.estado} onChange={(e) => upd('estado', e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contatos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Contatos</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => setContatos([...contatos, { nome: '', cargo: '', telefone: '', email: '' }])}>
              <Plus className="w-3 h-3" />Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {contatos.map((c, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 relative">
                {contatos.length > 1 && (
                  <button type="button" onClick={() => setContatos(contatos.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 text-red-500 p-1">
                    <X className="w-3 h-3" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Nome</Label><Input value={c.nome} onChange={(e) => updContato(i, 'nome', e.target.value)} /></div>
                  <div><Label>Cargo</Label><Input value={c.cargo} onChange={(e) => updContato(i, 'cargo', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Telefone</Label><Input value={c.telefone} onChange={(e) => updContato(i, 'telefone', e.target.value)} /></div>
                  <div><Label>E-mail</Label><Input value={c.email} onChange={(e) => updContato(i, 'email', e.target.value)} /></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Comercial */}
        <Card>
          <CardHeader><CardTitle className="text-base">Comercial & Financeiro</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Limite de crédito</Label>
                <Input type="number" step="0.01" value={form.limiteCredito} onChange={(e) => upd('limiteCredito', e.target.value)} />
              </div>
              <div>
                <Label>Status financeiro</Label>
                <Select value={form.statusFinanc} onChange={(e) => upd('statusFinanc', e.target.value)}>
                  <option value="ATIVO">Ativo</option>
                  <option value="INADIMPLENTE">Inadimplente</option>
                  <option value="BLOQUEADO">Bloqueado</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Condição de pagamento</Label>
              <Select value={form.condicaoPgto} onChange={(e) => upd('condicaoPgto', e.target.value)}>
                <option>À vista</option>
                <option>Boleto 7 dias</option>
                <option>Boleto 15 dias</option>
                <option>Boleto 30 dias</option>
                <option>Boleto 30/45/60 dias</option>
                <option>Boleto 30/60/90 dias</option>
                <option>Cheque</option>
                <option>PIX</option>
              </Select>
            </div>
            <div>
              <Label>Dados bancários</Label>
              <Textarea value={form.dadosBancarios} onChange={(e) => upd('dadosBancarios', e.target.value)} rows={2} />
            </div>
            <div>
              <Label>Tags (separar por vírgula)</Label>
              <Input value={form.tags} onChange={(e) => upd('tags', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div>
          <Label>Observações internas</Label>
          <Textarea value={form.observacoes} onChange={(e) => upd('observacoes', e.target.value)} rows={3} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.ativo} onChange={(e) => upd('ativo', e.target.checked)} className="w-4 h-4 rounded" />
          Cliente ativo
        </label>

        <div className="flex gap-2 sticky bottom-0 bg-slate-50 dark:bg-slate-950 py-3">
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href={`/clientes/${cliente.id}`}>Cancelar</Link>
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

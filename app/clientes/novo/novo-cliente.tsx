'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Upload, X, ImageIcon, User, Phone, Mail } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Label } from '../../../components/ui/label';
import ThemeBackButton from '../../../components/theme-back-button';

type Contato = { nome: string; cargo: string; telefone: string; email: string };

export default function NovoCliente() {
  const router = useRouter();
  const [form, setForm] = useState({
    nome: '',
    nomeFantasia: '',
    tipo: 'PESSOA_JURIDICA',
    cpfCnpj: '',
    inscricaoEstadual: '',
    email: '',
    site: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    limiteCredito: '',
    condicaoPgto: 'Boleto 30 dias',
    dadosBancarios: '',
    statusFinanc: 'ATIVO',
    tags: '',
    observacoes: '',
    foto: '',
  });
  const [contatos, setContatos] = useState<Contato[]>([{ nome: '', cargo: '', telefone: '', email: '' }]);
  const [salvando, setSalvando] = useState(false);

  function upd(k: string, v: any) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function updContato(i: number, k: keyof Contato, v: string) {
    setContatos((c) => c.map((x, idx) => (idx === i ? { ...x, [k]: v } : x)));
  }

  async function uploadFoto(file: File) {
    try {
      const { uploadFile } = await import('../../../lib/upload');
      const d = await uploadFile(file);
      upd('foto', d.url);
      toast.success('Logo enviado');
    } catch (e: any) {
      toast.error('Erro ao enviar logo: ' + (e?.message || ''));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome) {
      toast.error('Preencha o nome do cliente');
      return;
    }
    setSalvando(true);
    try {
      const r = await fetch('/api/clientes', {
        method: 'POST',
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
      toast.success('Cliente cadastrado!');
      router.push('/clientes');
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
            <ThemeBackButton href="/clientes" />
            <h1 className="text-lg font-bold">Novo cliente</h1>
          </div>
        </div>
      </header>

      <form onSubmit={submit} className="max-w-3xl mx-auto p-4 space-y-4 animate-fade-in">
        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logo / Foto</CardTitle>
          </CardHeader>
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
                    className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                  />
                </label>
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
              <Label>Nome / Razão Social *</Label>
              <Input value={form.nome} onChange={(e) => upd('nome', e.target.value)} required autoFocus />
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
          <CardHeader>
            <CardTitle className="text-base">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>CEP</Label>
                <Input value={form.cep} onChange={(e) => upd('cep', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Endereço</Label>
                <Input value={form.endereco} onChange={(e) => upd('endereco', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Número</Label>
                <Input value={form.numero} onChange={(e) => upd('numero', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Complemento</Label>
                <Input value={form.complemento} onChange={(e) => upd('complemento', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Bairro</Label>
                <Input value={form.bairro} onChange={(e) => upd('bairro', e.target.value)} />
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={form.cidade} onChange={(e) => upd('cidade', e.target.value)} />
              </div>
              <div>
                <Label>UF</Label>
                <Input
                  value={form.estado}
                  onChange={(e) => upd('estado', e.target.value.toUpperCase().slice(0, 2))}
                  maxLength={2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contatos múltiplos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Contatos</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setContatos([...contatos, { nome: '', cargo: '', telefone: '', email: '' }])}
            >
              <Plus className="w-3 h-3" /> Adicionar
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {contatos.map((c, i) => (
              <div key={i} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 relative">
                {contatos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setContatos(contatos.filter((_, idx) => idx !== i))}
                    className="absolute top-2 right-2 text-red-500 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Nome</Label>
                    <Input value={c.nome} onChange={(e) => updContato(i, 'nome', e.target.value)} />
                  </div>
                  <div>
                    <Label>Cargo</Label>
                    <Input value={c.cargo} onChange={(e) => updContato(i, 'cargo', e.target.value)} placeholder="Comprador, Gerente..." />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Telefone</Label>
                    <Input value={c.telefone} onChange={(e) => updContato(i, 'telefone', e.target.value)} />
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input value={c.email} onChange={(e) => updContato(i, 'email', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Financeiro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comercial & Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Limite de crédito (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.limiteCredito}
                  onChange={(e) => upd('limiteCredito', e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div>
                <Label>Status financeiro</Label>
                <Select value={form.statusFinanc} onChange={(e) => upd('statusFinanc', e.target.value)}>
                  <option value="ATIVO">Ativo (normal)</option>
                  <option value="INADIMPLENTE">Inadimplente</option>
                  <option value="BLOQUEADO">Bloqueado</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Condição de pagamento padrão</Label>
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
              <Label>Dados bancários (opcional)</Label>
              <Textarea
                value={form.dadosBancarios}
                onChange={(e) => upd('dadosBancarios', e.target.value)}
                rows={2}
                placeholder="Banco, agência, conta..."
              />
            </div>
            <div>
              <Label>Tags (separar por vírgula)</Label>
              <Input
                value={form.tags}
                onChange={(e) => upd('tags', e.target.value)}
                placeholder="VIP, Atacado, Semanal"
              />
            </div>
          </CardContent>
        </Card>

        <div>
          <Label>Observações internas</Label>
          <Textarea
            value={form.observacoes}
            onChange={(e) => upd('observacoes', e.target.value)}
            rows={3}
            placeholder="Preferências, restrições, informações úteis..."
          />
        </div>

        <div className="flex gap-2 sticky bottom-0 bg-slate-50 dark:bg-slate-950 py-3 -mx-4 px-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => router.push('/clientes')} className="flex-1">
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

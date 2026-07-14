'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Users, UserCog, Shield, Package, Truck, Save, X, Trash2, Edit, MoreVertical, Power, KeyRound } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { cn } from '../../lib/utils';

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  criadoEm: string;
  totalPedidos: number;
};

const PERFIL_INFO: Record<string, { label: string; variant: any; icon: any; cor: string; desc: string }> = {
  ADMIN: { label: 'Administrador', variant: 'default', icon: Shield, cor: 'bg-purple-100 text-purple-700 border-purple-300', desc: 'Acesso total + gerencia usuários' },
  GERENTE: { label: 'Gerente', variant: 'info', icon: UserCog, cor: 'bg-blue-100 text-blue-700 border-blue-300', desc: 'Acesso total aos módulos' },
  VENDEDOR: { label: 'Vendedor', variant: 'success', icon: Package, cor: 'bg-green-100 text-green-700 border-green-300', desc: 'Cria pedidos, consulta dados' },
  CD: { label: 'Centro de Distribuição', variant: 'warning', icon: Truck, cor: 'bg-orange-100 text-orange-700 border-orange-300', desc: 'Gerencia separação e despacho' },
};

const PERFIL_OPCOES = [
  { value: 'VENDEDOR', ...PERFIL_INFO.VENDEDOR },
  { value: 'CD', ...PERFIL_INFO.CD },
  { value: 'GERENTE', ...PERFIL_INFO.GERENTE },
  { value: 'ADMIN', ...PERFIL_INFO.ADMIN },
];

export default function UsuariosClient({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter();
  const [mostrarNovo, setMostrarNovo] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'VENDEDOR' });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [editForm, setEditForm] = useState({ nome: '', email: '', perfil: '', senha: '' });
  const [salvandoEdit, setSalvandoEdit] = useState(false);

  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter((u) => u.ativo).length,
    admins: usuarios.filter((u) => u.perfil === 'ADMIN').length,
    inativos: usuarios.filter((u) => !u.ativo).length,
  };

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (!form.nome || !form.email || !form.senha) {
      setErro('Todos os campos são obrigatórios');
      return;
    }
    if (form.senha.length < 6) {
      setErro('Senha precisa ter pelo menos 6 caracteres');
      return;
    }
    setSalvando(true);
    try {
      const r = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        let msg = 'Erro ao criar';
        try {
          const d = await r.json();
          msg = d.error || msg;
        } catch {}
        setErro(msg);
        toast.error('Erro', { description: msg });
        return;
      }
      toast.success('Usuário criado!', { description: form.nome });
      setMostrarNovo(false);
      setForm({ nome: '', email: '', senha: '', perfil: 'VENDEDOR' });
      router.refresh();
    } catch (e: any) {
      const msg = 'Erro de conexão: ' + (e.message || 'desconhecido');
      setErro(msg);
      toast.error('Erro de conexão', { description: msg });
    } finally {
      setSalvando(false);
    }
  }

  function abrirEdicao(u: Usuario) {
    setEditando(u);
    setEditForm({ nome: u.nome, email: u.email, perfil: u.perfil, senha: '' });
  }

  async function salvarEdicao() {
    if (!editando) return;
    if (!editForm.nome || !editForm.email) {
      toast.error('Nome e e-mail são obrigatórios');
      return;
    }
    setSalvandoEdit(true);
    try {
      const body: any = { nome: editForm.nome, email: editForm.email, perfil: editForm.perfil };
      if (editForm.senha) {
        if (editForm.senha.length < 6) {
          toast.error('Senha precisa ter pelo menos 6 caracteres');
          return;
        }
        body.senha = editForm.senha;
      }
      const r = await fetch(`/api/usuarios/${editando.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        let msg = 'Erro ao atualizar';
        try {
          const d = await r.json();
          msg = d.error || msg;
        } catch {}
        toast.error('Erro', { description: msg });
        return;
      }
      toast.success('Usuário atualizado!');
      setEditando(null);
      router.refresh();
    } catch (e: any) {
      toast.error('Erro de conexão', { description: e.message });
    } finally {
      setSalvandoEdit(false);
    }
  }

  async function toggleAtivo(u: Usuario) {
    const r = await fetch(`/api/usuarios/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !u.ativo }),
    });
    if (r.ok) {
      toast.success(u.ativo ? `${u.nome} desativado` : `${u.nome} reativado`);
      router.refresh();
    } else {
      toast.error('Erro ao alterar status');
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserCog className="w-6 h-6" />Usuários
          </h1>
          <p className="text-sm text-slate-500">Gerencie quem acessa o sistema e com qual permissão</p>
        </div>
        <Button onClick={() => setMostrarNovo(!mostrarNovo)} variant={mostrarNovo ? 'outline' : 'accent'}>
          {mostrarNovo ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {mostrarNovo ? 'Cancelar' : 'Novo usuário'}
        </Button>
      </div>

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
            <p className="text-xs text-slate-500">Ativos</p>
            <p className="text-2xl font-black mt-1 text-green-600">{stats.ativos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Administradores</p>
            <p className="text-2xl font-black mt-1 text-purple-600">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card className={stats.inativos > 0 ? 'border-amber-200 dark:border-amber-900/40' : ''}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Inativos</p>
            <p className="text-2xl font-black mt-1 text-amber-600">{stats.inativos}</p>
          </CardContent>
        </Card>
      </div>

      {/* Form novo */}
      {mostrarNovo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4" />Novo usuário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={criar} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Nome completo *</Label>
                  <Input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: João Silva"
                    required
                  />
                </div>
                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@empresa.com"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Senha * <span className="text-slate-400 font-normal">(mín. 6 caracteres)</span></Label>
                  <Input
                    type="password"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <Label>Perfil de acesso *</Label>
                  <select
                    className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm mt-1"
                    value={form.perfil}
                    onChange={(e) => setForm({ ...form, perfil: e.target.value })}
                  >
                    {PERFIL_OPCOES.map((p) => {
                      const Icon = p.icon;
                      return (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Sobre o perfil selecionado</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <b className="text-purple-700 dark:text-purple-400">⚡ {PERFIL_INFO[form.perfil].label}:</b> {PERFIL_INFO[form.perfil].desc}
                </p>
              </div>
              {erro && <p className="text-sm text-red-600">{erro}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setMostrarNovo(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={salvando} className="flex-1">
                  {salvando ? 'Criando...' : 'Criar usuário'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      {usuarios.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-500">
            <UserCog className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum usuário cadastrado</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {usuarios.map((u) => {
                const info = PERFIL_INFO[u.perfil] || PERFIL_INFO.VENDEDOR;
                const Icon = info.icon;
                return (
                  <div
                    key={u.id}
                    className={cn(
                      'p-4 flex items-center gap-4 transition-colors',
                      !u.ativo && 'opacity-50'
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-black text-lg shrink-0">
                      {u.nome.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{u.nome}</p>
                        {!u.ativo && <Badge variant="danger">Inativo</Badge>}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border', info.cor)}>
                          <Icon className="w-3 h-3" />
                          {info.label}
                        </span>
                        <span className="text-xs text-slate-500">{u.totalPedidos} pedidos</span>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => abrirEdicao(u)}
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAtivo(u)}
                        title={u.ativo ? 'Desativar' : 'Reativar'}
                      >
                        <Power className={cn('w-4 h-4', u.ativo ? 'text-red-500' : 'text-green-500')} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog de edição */}
      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
            <DialogDescription>
              Altere dados, perfil ou redefina a senha
            </DialogDescription>
          </DialogHeader>
          {editando && (
            <div className="space-y-3">
              <div>
                <Label>Nome *</Label>
                <Input
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                />
              </div>
              <div>
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Perfil de acesso *</Label>
                <select
                  className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm mt-1"
                  value={editForm.perfil}
                  onChange={(e) => setEditForm({ ...editForm, perfil: e.target.value })}
                >
                  {PERFIL_OPCOES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Nova senha <span className="text-slate-400 font-normal">(deixe vazio pra manter)</span></Label>
                <Input
                  type="password"
                  value={editForm.senha}
                  onChange={(e) => setEditForm({ ...editForm, senha: e.target.value })}
                  placeholder="••••••"
                />
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                <p><b>Criado em:</b> {new Date(editando.criadoEm).toLocaleDateString('pt-BR')}</p>
                <p><b>Total de pedidos:</b> {editando.totalPedidos}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditando(null)} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={salvarEdicao} disabled={salvandoEdit} className="flex-1">
                  {salvandoEdit ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

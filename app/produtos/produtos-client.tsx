'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, Filter, Star, AlertTriangle, PackageX } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

export default function ProdutosListClient({
  categorias,
  marcas,
}: {
  categorias: { id: number; nome: string; cor: string | null; icone: string | null }[];
  marcas: { id: number; nome: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [busca, setBusca] = useState(params.get('q') || '');
  const cat = params.get('cat');
  const status = params.get('status');

  function update(updates: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') sp.delete(k);
      else sp.set(k, v);
    });
    router.push('/produtos?' + sp.toString());
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update({ q: busca || null });
  }

  const filtrosRapidos = [
    { key: 'destaque', label: 'Destaques', icon: Star },
    { key: 'baixo', label: 'Estoque baixo', icon: AlertTriangle },
    { key: 'sem_estoque', label: 'Sem estoque', icon: PackageX },
  ];

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou SKU..."
          className="pl-10"
        />
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => update({ cat: null, status: null })}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
            !cat && !status
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          )}
        >
          Todos
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            onClick={() => update({ cat: String(c.id), status: null })}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
              cat === String(c.id)
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            )}
            style={cat === String(c.id) ? { backgroundColor: c.cor || undefined } : {}}
          >
            {c.nome}
          </button>
        ))}
        <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1" />
        {filtrosRapidos.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.key}
              onClick={() => update({ status: status === f.key ? null : f.key, cat: null })}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
                status === f.key
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              <Icon className="w-3 h-3" />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';

export default function ClientesListClient({ ufs }: { ufs: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busca, setBusca] = useState(params.get('q') || '');
  const uf = params.get('uf');
  const status = params.get('status');

  function update(updates: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === '') sp.delete(k);
      else sp.set(k, v);
    });
    router.push('/clientes?' + sp.toString());
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    update({ q: busca || null });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, CNPJ, cidade..."
          className="pl-10"
        />
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => update({ uf: null, status: null })}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap',
            !uf && !status
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          )}
        >
          Todos
        </button>
        <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1" />
        {ufs.map((u) => (
          <button
            key={u}
            onClick={() => update({ uf: uf === u ? null : u, status: null })}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap',
              uf === u
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            )}
          >
            {u}
          </button>
        ))}
        <div className="w-px bg-slate-200 dark:bg-slate-800 mx-1" />
        <button
          onClick={() => update({ status: status === 'INADIMPLENTE' ? null : 'INADIMPLENTE' })}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap',
            status === 'INADIMPLENTE'
              ? 'bg-red-500 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
          )}
        >
          Inadimplentes
        </button>
      </div>
    </div>
  );
}

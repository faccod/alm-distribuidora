'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { STATUS_LABEL } from '../../../lib/format';

const PROXIMOS: Record<string, string[]> = {
  RASCUNHO: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['EM_SEPARACAO', 'CANCELADO'],
  EM_SEPARACAO: ['DESPACHADO', 'CANCELADO'],
  DESPACHADO: ['ENTREGUE', 'CANCELADO'],
  ENTREGUE: [],
  CANCELADO: [],
};

export default function StatusChanger({ pedidoId, statusAtual }: { pedidoId: string; statusAtual: string }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);

  const proximos = PROXIMOS[statusAtual] || [];
  if (proximos.length === 0) {
    return (
      <section className="card text-center text-sm text-slate-500">
        Pedido finalizado — sem mudanças de status disponíveis.
      </section>
    );
  }

  async function mudar(novo: string) {
    setSalvando(true);
    try {
      const r = await fetch(`/api/pedidos/${pedidoId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novo }),
      });
      if (r.ok) {
        router.refresh();
      }
    } finally {
      setSalvando(false);
    }
  }

  return (
    <section className="card">
      <h2 className="font-bold text-slate-900 mb-2">Mudar status</h2>
      <div className="grid grid-cols-2 gap-2">
        {proximos.map((s) => (
          <button
            key={s}
            onClick={() => mudar(s)}
            disabled={salvando}
            className={`btn text-sm ${s === 'CANCELADO' ? 'btn-danger' : 'btn-primary'}`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>
    </section>
  );
}

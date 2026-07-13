'use client';
import { useEffect, useState } from 'react';
import {
  listarPedidosPendentes,
  removerPedidoOffline,
  salvarPedidoOffline,
  PedidoPendente,
} from './offline';

export function useOnline() {
  const [online, setOnline] = useState(true);
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);

    const onOnline = () => {
      setOnline(true);
      sincronizar();
    };
    const onOffline = () => setOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    // Conta pendentes ao montar
    listarPedidosPendentes().then((l) => setPendentes(l.length));

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  async function adicionar(p: PedidoPendente) {
    await salvarPedidoOffline(p);
    const lista = await listarPedidosPendentes();
    setPendentes(lista.length);
    if (navigator.onLine) {
      await sincronizar();
    }
  }

  async function sincronizar() {
    if (!navigator.onLine) return;
    setSincronizando(true);
    try {
      const lista = await listarPedidosPendentes();
      for (const p of lista) {
        const r = await fetch('/api/pedidos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clienteId: p.clienteId,
            vendedorId: p.vendedorId,
            condicaoPgto: p.condicaoPgto,
            observacoes: p.observacoes,
            status: p.status,
            itens: p.itens.map((i) => ({
              produtoId: i.produtoId,
              quantidade: i.quantidade,
              precoUnit: i.precoUnit,
              observacao: i.observacao,
            })),
            // enviar id offline pra evitar duplicar
            offlineId: p.id,
          }),
        });
        if (r.ok) {
          await removerPedidoOffline(p.id);
        } else {
          // falhou — vai tentar de novo depois
          break;
        }
      }
      const nova = await listarPedidosPendentes();
      setPendentes(nova.length);
    } finally {
      setSincronizando(false);
    }
  }

  return { online, pendentes, sincronizando, adicionar, sincronizar };
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  MoreVertical,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  RotateCcw,
  Send,
  PlayCircle,
  Truck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

const STATUS_INFO: Record<string, { label: string; icon: any; cor: string; ordem: number }> = {
  RASCUNHO: { label: 'Rascunho', icon: FileText, cor: 'text-slate-600', ordem: 0 },
  ENVIADO: { label: 'Enviado (aguardando)', icon: Send, cor: 'text-blue-600', ordem: 1 },
  EM_SEPARACAO: { label: 'Em separação', icon: PlayCircle, cor: 'text-yellow-600', ordem: 2 },
  DESPACHADO: { label: 'Despachado', icon: Truck, cor: 'text-purple-600', ordem: 3 },
  ENTREGUE: { label: 'Entregue', icon: CheckCircle2, cor: 'text-green-600', ordem: 4 },
  CANCELADO: { label: 'Cancelado', icon: X, cor: 'text-red-600', ordem: -1 },
};

export function AcoesPedido({
  pedidoId,
  statusAtual,
  onMudou,
}: {
  pedidoId: string;
  statusAtual: string;
  onMudou?: (novoStatus: string) => void;
}) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const info = STATUS_INFO[statusAtual] || STATUS_INFO.ENVIADO;
  const Icon = info.icon;

  async function mudar(novo: string) {
    if (novo === statusAtual) return;
    setSalvando(true);
    try {
      const r = await fetch(`/api/pedidos/${pedidoId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novo }),
      });
      if (r.ok) {
        toast.success('Status atualizado!', {
          description: `Pedido agora está: ${STATUS_INFO[novo].label}`,
        });
        onMudou?.(novo);
        router.refresh();
      } else {
        const d = await r.json();
        toast.error('Erro', { description: d.error });
      }
    } finally {
      setSalvando(false);
    }
  }

  // Define qual é o "próximo" status (avançar) e "anterior" (voltar)
  const ordemAtual = info.ordem;
  const proximo = Object.entries(STATUS_INFO).find(([k, v]) => v.ordem === ordemAtual + 1);
  const anterior = Object.entries(STATUS_INFO).find(([k, v]) => v.ordem === ordemAtual - 1);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="default" size="sm" disabled={salvando}>
          <Icon className="w-3.5 h-3.5" />
          {salvando ? 'Atualizando...' : info.label}
          <MoreVertical className="w-3 h-3 ml-1" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={4}
          className="z-50 min-w-[260px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl p-1 animate-in"
        >
          {/* Avançar / Voltar (atalhos) */}
          {proximo && (
            <>
              <DropdownMenu.Label className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Avançar
              </DropdownMenu.Label>
              <DropdownMenu.Item
                onSelect={() => mudar(proximo[0])}
                className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 outline-none"
              >
                {(() => {
                  const I = proximo[1].icon;
                  return <I className={cn('w-4 h-4', proximo[1].cor)} />;
                })()}
                <span>Marcar como <b>{proximo[1].label}</b></span>
                <ChevronRight className="w-3 h-3 ml-auto text-slate-400" />
              </DropdownMenu.Item>
            </>
          )}

          {anterior && (
            <DropdownMenu.Item
              onSelect={() => mudar(anterior[0])}
              className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 outline-none"
            >
              {(() => {
                const I = anterior[1].icon;
                return <I className={cn('w-4 h-4', anterior[1].cor)} />;
              })()}
              <span>Voltar para <b>{anterior[1].label}</b></span>
              <ChevronLeft className="w-3 h-3 ml-auto text-slate-400" />
            </DropdownMenu.Item>
          )}

          <DropdownMenu.Separator className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

          {/* Lista completa de status */}
          <DropdownMenu.Label className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Mudar para qualquer status
          </DropdownMenu.Label>
          {Object.entries(STATUS_INFO)
            .filter(([k]) => k !== statusAtual)
            .map(([k, v]) => {
              const I = v.icon;
              return (
                <DropdownMenu.Item
                  key={k}
                  onSelect={() => mudar(k)}
                  className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 outline-none"
                >
                  <I className={cn('w-4 h-4', v.cor)} />
                  <span>{v.label}</span>
                  {k === statusAtual && <Check className="w-3 h-3 ml-auto text-green-600" />}
                </DropdownMenu.Item>
              );
            })}

          {/* Reabrir (cancelado/voltar do cancelado) */}
          {(statusAtual === 'CANCELADO' || statusAtual === 'ENTREGUE') && (
            <>
              <DropdownMenu.Separator className="h-px bg-slate-200 dark:bg-slate-800 my-1" />
              <DropdownMenu.Item
                onSelect={() => mudar('RASCUNHO')}
                className="flex items-center gap-2 px-2 py-2 rounded-md text-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 outline-none"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reabrir como Rascunho</span>
              </DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

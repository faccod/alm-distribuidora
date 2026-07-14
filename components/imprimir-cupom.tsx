'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Printer, Bluetooth, Copy, Download, X, Check, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from './ui/dialog';
import { gerarCupom58mm, textoParaESCPOS } from '../lib/cupom-termico';

type Pedido = {
  numero: number;
  data: string;
  total: number;
  desconto?: number;
  condicaoPgto?: string | null;
  observacoes?: string | null;
  cliente: { nome: string; cidade?: string | null; estado?: string | null; endereco?: string | null; contatos?: string | null };
  vendedor: { nome: string };
  itens: Array<{ quantidade: number; produtoNome: string; unidade: string; precoUnit: number; total: number }>;
};

export function ImprimirCupom({ pedido }: { pedido: Pedido }) {
  const [open, setOpen] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [enviandoBT, setEnviandoBT] = useState(false);
  const [copied, setCopied] = useState(false);

  const cupom = gerarCupom58mm(pedido as any);

  // Abre o dialog de impressão do sistema, focado em impressora térmica
  function imprimirViaSistema() {
    setPrinting(true);
    const janela = window.open('', 'cupom', 'width=400,height=600');
    if (!janela) {
      toast.error('Popup bloqueado', { description: 'Permita popups pra este site' });
      setPrinting(false);
      return;
    }
    janela.document.write(`<!DOCTYPE html>
<html><head><title>Cupom #${String(pedido.numero).padStart(6, '0')}</title>
<style>
  @page { size: 58mm auto; margin: 0; }
  body { font-family: 'Courier New', monospace; font-size: 10px; width: 58mm; padding: 4mm 2mm; margin: 0; color: #000; background: #fff; white-space: pre-wrap; }
  body.dark { color: #000; background: #fff; }
  @media print {
    body { width: auto; padding: 0; }
  }
</style>
</head><body>${escapeHtml(cupom)}</body></html>`);
    janela.document.close();
    setTimeout(() => {
      janela.focus();
      janela.print();
      setPrinting(false);
    }, 300);
    toast.success('Janela de impressão aberta', { description: 'Selecione a impressora térmica' });
  }

  // Web Bluetooth API
  async function imprimirViaBluetooth() {
    if (!(navigator as any).bluetooth) {
      toast.error('Bluetooth não suportado', {
        description: 'Use Chrome no Android. iOS Safari não suporta.',
      });
      return;
    }
    setEnviandoBT(true);
    try {
      // @ts-ignore
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Generic printer
          { services: ['0000ff00-0000-1000-8000-00805f9b34fb'] }, // Common printer service
        ],
        optionalServices: ['0000ff00-0000-1000-8000-00805f9b34fb', '000018f0-0000-1000-8000-00805f9b34fb'],
      });

      // @ts-ignore
      const server = await device.gatt.connect();
      // Tenta achar uma characteristic que aceite write
      const services = await server.getPrimaryServices();
      let char = null;
      for (const s of services) {
        const chars = await s.getCharacteristics();
        for (const c of chars) {
          if (c.properties.write || c.properties.writeWithoutResponse) {
            char = c;
            break;
          }
        }
        if (char) break;
      }
      if (!char) {
        toast.error('Não foi possível achar canal de escrita', {
          description: 'Tente parear a impressora antes',
        });
        // @ts-ignore
        device.gatt.disconnect();
        return;
      }

      const bytes = textoParaESCPOS(cupom);
      // Envia em chunks de 100 bytes (limite do BLE)
      const CHUNK = 100;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        await char.writeValueWithoutResponse(bytes.slice(i, i + CHUNK));
        await new Promise((r) => setTimeout(r, 50));
      }
      toast.success('✅ Cupom enviado!', {
        description: `Impresso em ${device.name || 'impressora Bluetooth'}`,
      });
      // @ts-ignore
      device.gatt.disconnect();
    } catch (e: any) {
      if (e.name === 'NotFoundError') {
        toast.error('Nenhuma impressora selecionada');
      } else {
        toast.error('Erro Bluetooth', { description: e.message });
      }
    } finally {
      setEnviandoBT(false);
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(cupom);
      setCopied(true);
      toast.success('Texto copiado!', { description: 'Cole no app da impressora' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar');
    }
  }

  function downloadTXT() {
    const blob = new Blob([cupom], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cupom-${String(pedido.numero).padStart(6, '0')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Arquivo baixado');
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Printer className="w-4 h-4" />Cupom Térmico
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />Imprimir Cupom Térmico (58mm)
            </DialogTitle>
            <DialogDescription>
              Escolha como quer enviar o cupom pra impressora
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Opções de impressão */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={imprimirViaSistema}
                disabled={printing}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left border-2 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-slate-100 transition-colors"
              >
                <Printer className="w-6 h-6 mb-2 text-slate-700 dark:text-slate-300" />
                <p className="font-bold text-sm">Imprimir</p>
                <p className="text-xs text-slate-500 mt-1">
                  {printing ? 'Abrindo...' : 'Janela do sistema. Escolha a impressora térmica.'}
                </p>
              </button>

              <button
                onClick={imprimirViaBluetooth}
                disabled={enviandoBT}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-colors"
              >
                <Bluetooth className="w-6 h-6 mb-2 text-blue-600" />
                <p className="font-bold text-sm">Bluetooth</p>
                <p className="text-xs text-slate-500 mt-1">
                  {enviandoBT ? 'Conectando...' : 'Conexão direta (Chrome/Android)'}
                </p>
              </button>

              <button
                onClick={copiar}
                className="p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left border-2 border-slate-200 dark:border-slate-700 hover:border-slate-900 dark:hover:border-slate-100 transition-colors"
              >
                {copied ? (
                  <Check className="w-6 h-6 mb-2 text-green-600" />
                ) : (
                  <Copy className="w-6 h-6 mb-2 text-slate-700 dark:text-slate-300" />
                )}
                <p className="font-bold text-sm">Copiar texto</p>
                <p className="text-xs text-slate-500 mt-1">
                  Cole no app da impressora
                </p>
              </button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadTXT} className="flex-1">
                <Download className="w-4 h-4" />Baixar .txt
              </Button>
            </div>

            {/* Info de compatibilidade */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300 space-y-1">
              <p className="font-semibold">💡 Dicas de impressão térmica:</p>
              <p>• <b>Via sistema:</b> Funciona em qualquer navegador. Selecione "Impressora térmica" na lista de impressoras.</p>
              <p>• <b>Bluetooth:</b> Requer Chrome no Android. iOS Safari não suporta Web Bluetooth.</p>
              <p>• <b>App dedicado:</b> Se tiver app da impressora (Bematech, Elgin, etc), baixe o .txt e abra no app.</p>
            </div>

            {/* Preview do cupom */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Preview do cupom (58mm)</p>
              <pre
                className="font-mono text-[10px] p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto whitespace-pre"
                style={{ lineHeight: '1.4' }}
              >
                {cupom}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

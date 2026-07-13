import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';
import { redirect, notFound } from 'next/navigation';
import { brl, STATUS_COR, STATUS_LABEL } from '../../../lib/format';
import Link from 'next/link';
import { Printer, MessageCircle } from 'lucide-react';
import StatusChanger from './status-changer';
import { ImprimirCupom } from '../../../components/imprimir-cupom';
import { Button } from '../../../components/ui/button';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      vendedor: true,
      itens: { include: { produto: true } },
      historico: { orderBy: { data: 'desc' } },
    },
  });

  if (!pedido) notFound();

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/pedidos" className="text-sm">← Voltar</Link>
          <h1 className="font-bold">Pedido #{pedido.numero}</h1>
          <div className="text-xs opacity-70">
            {new Date(pedido.data).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </header>

      <main className="p-3 max-w-3xl mx-auto space-y-3">
        <section className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Status</p>
              <span className={`badge ${STATUS_COR[pedido.status]} text-base`}>
                {STATUS_LABEL[pedido.status]}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-2xl font-black text-green-600">{brl(pedido.total)}</p>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="font-bold text-slate-900 mb-2">Cliente</h2>
          <p className="font-semibold">{pedido.cliente.nome}</p>
          {pedido.cliente.endereco && (
            <p className="text-sm text-slate-600">{pedido.cliente.endereco}</p>
          )}
          {pedido.cliente.bairro && (
            <p className="text-sm text-slate-600">{pedido.cliente.bairro}</p>
          )}
          <p className="text-sm text-slate-600">
            {pedido.cliente.cidade}/{pedido.cliente.estado}
          </p>
          {pedido.cliente.email && (
            <p className="text-xs text-slate-500 mt-1">Email: {pedido.cliente.email}</p>
          )}
        </section>

        <section className="card">
          <h2 className="font-bold text-slate-900 mb-2">Itens ({pedido.itens.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 border-b border-slate-200">
                <th className="pb-1">Qtd</th>
                <th className="pb-1">Produto</th>
                <th className="pb-1 text-right">Unit.</th>
                <th className="pb-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedido.itens.map((i) => (
                <tr key={i.id}>
                  <td className="py-2 pr-1 align-top">
                    {Number(i.quantidade)}
                    <span className="text-xs text-slate-500"> {i.produto.unidade}</span>
                  </td>
                  <td className="py-2 pr-1">
                    <p className="font-semibold">{i.produto.nome}</p>
                    {i.observacao && (
                      <p className="text-xs text-slate-500 italic">{i.observacao}</p>
                    )}
                  </td>
                  <td className="py-2 text-right align-top">
                    {brl(Number(i.precoUnit))}
                  </td>
                  <td className="py-2 text-right align-top font-bold">
                    {brl(Number(i.total))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300">
                <td colSpan={3} className="pt-2 text-right font-bold">TOTAL</td>
                <td className="pt-2 text-right font-black text-lg text-green-600">
                  {brl(pedido.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </section>

        {pedido.condicaoPgto && (
          <section className="card">
            <h2 className="font-bold text-slate-900 mb-1">Condição de pagamento</h2>
            <p className="text-sm">{pedido.condicaoPgto}</p>
          </section>
        )}

        {pedido.observacoes && (
          <section className="card bg-yellow-50 border-yellow-200">
            <h2 className="font-bold text-slate-900 mb-1">📝 Observações</h2>
            <p className="text-sm whitespace-pre-wrap">{pedido.observacoes}</p>
          </section>
        )}

        <StatusChanger pedidoId={pedido.id} statusAtual={pedido.status} />

        {pedido.historico.length > 0 && (
          <section className="card">
            <h2 className="font-bold text-slate-900 mb-2">Histórico</h2>
            <ul className="space-y-1 text-xs text-slate-600">
              {pedido.historico.map((h) => (
                <li key={h.id} className="flex justify-between">
                  <span>→ {STATUS_LABEL[h.status] || h.status}</span>
                  <span>
                    {h.usuario} · {new Date(h.data).toLocaleString('pt-BR')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button asChild variant="outline" size="sm" className="h-10">
            <Link href={`/pedidos/${pedido.id}/imprimir`} target="_blank" rel="noreferrer">
              <Printer className="w-4 h-4" />Imprimir A4
            </Link>
          </Button>
          <ImprimirCupom pedido={{
            numero: pedido.numero,
            data: pedido.data.toISOString(),
            total: pedido.total,
            desconto: pedido.desconto || undefined,
            condicaoPgto: pedido.condicaoPgto,
            observacoes: pedido.observacoes,
            cliente: pedido.cliente,
            vendedor: pedido.vendedor,
            itens: pedido.itens.map((i) => ({
              quantidade: Number(i.quantidade),
              produtoNome: i.produto.nome,
              unidade: i.produto.unidade,
              precoUnit: Number(i.precoUnit),
              total: Number(i.total),
            })),
          }} />
          <Button asChild variant="outline" size="sm" className="h-10">
            <Link href={`/pedidos/${pedido.id}/whatsapp`}>
              <MessageCircle className="w-4 h-4" />WhatsApp
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

import { prisma } from '../../../../lib/prisma';
import { buscarSessao } from '../../../../lib/auth';
import { redirect, notFound } from 'next/navigation';
import { brl } from '../../../../lib/format';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');

  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: { cliente: true, itens: { include: { produto: true } } },
  });
  if (!pedido) notFound();

  // Monta a mensagem
  const linhas: string[] = [];
  linhas.push(`*Pedido ALM #${pedido.numero}*`);
  linhas.push(`Cliente: ${pedido.cliente.nome}`);
  if (pedido.cliente.cidade) linhas.push(`Cidade: ${pedido.cliente.cidade}/${pedido.cliente.estado}`);
  linhas.push('');
  linhas.push('*Itens:*');
  for (const i of pedido.itens) {
    let l = `• ${Number(i.quantidade)}x ${i.produto.nome}`;
    if (i.observacao) l += ` (${i.observacao})`;
    l += ` — ${brl(Number(i.total))}`;
    linhas.push(l);
  }
  linhas.push('');
  linhas.push(`*Total: ${brl(pedido.total)}*`);
  if (pedido.condicaoPgto) {
    linhas.push(`Pgto: ${pedido.condicaoPgto}`);
  }
  if (pedido.observacoes) {
    linhas.push(`Obs: ${pedido.observacoes}`);
  }

  const texto = linhas.join('\n');
  const textoEncoded = encodeURIComponent(texto);

  // Telefone: tenta pegar do JSON de contatos (campo telefone do 1º contato), senão abre sem destinatário
  let tel = '';
  try {
    if (pedido.cliente.contatos) {
      const lista = JSON.parse(pedido.cliente.contatos);
      if (Array.isArray(lista) && lista[0]?.telefone) {
        tel = String(lista[0].telefone).replace(/\D/g, '');
      }
    }
  } catch {}
  const waLink = tel
    ? `https://wa.me/55${tel}?text=${textoEncoded}`
    : `https://wa.me/?text=${textoEncoded}`;

  return (
    <div className="min-h-screen p-4 max-w-3xl mx-auto">
      <style>{`
        @media print { .no-print { display: none !important; } }
      `}</style>

      <div className="no-print mb-4 flex gap-2">
        <Link href={`/pedidos/${pedido.id}`} className="btn btn-ghost">← Voltar</Link>
        <a href={waLink} target="_blank" rel="noreferrer" className="btn btn-accent flex-1">
          📱 Abrir WhatsApp
        </a>
      </div>

      <h1 className="text-2xl font-bold mb-3">📱 Mensagem para WhatsApp</h1>

      <div className="card bg-green-50 border-green-200">
        <p className="text-sm text-green-800 mb-2">
          {tel ? `✅ Vai abrir conversa com o cliente (${tel})` : '⚠️ Sem telefone do cliente — vai abrir WhatsApp sem destinatário'}
        </p>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-3 rounded border border-slate-200">
{texto}
        </pre>
      </div>

      <p className="text-xs text-slate-500 mt-3 no-print">
        💡 Dica: toque em "Abrir WhatsApp" e o app vai abrir com a mensagem pronta. É só revisar e enviar.
      </p>
    </div>
  );
}

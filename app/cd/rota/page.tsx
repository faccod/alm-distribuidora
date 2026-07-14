import { prisma } from '../../../lib/prisma';
import { buscarSessao } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import { brl } from '../../../lib/format';
import { PrintButton } from '../../../components/print-button';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: { data?: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');
  if (sessao.perfil !== 'CD' && sessao.perfil !== 'GERENTE' && sessao.perfil !== 'ADMIN') {
    return <div className="p-6 text-center">Sem permissão.</div>;
  }

  // Pedidos a separar (ENVIADO + EM_SEPARACAO) do dia
  const pedidos = await prisma.pedido.findMany({
    where: { status: { in: ['ENVIADO', 'EM_SEPARACAO'] } },
    orderBy: [{ cliente: { cidade: 'asc' } }, { cliente: { estado: 'asc' } }, { data: 'asc' }],
    include: { cliente: true, itens: true, vendedor: true },
  });

  // Agrupa por cidade
  const grupos = new Map<string, typeof pedidos>();
  for (const p of pedidos) {
    const chave = `${p.cliente.cidade || '?'} / ${p.cliente.estado || '?'}`;
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave)!.push(p);
  }

  return (
    <div className="bg-white text-black min-h-screen p-4 max-w-4xl mx-auto print:p-2">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { font-size: 11px; }
          .rota { page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print mb-4 flex gap-2">
        <PrintButton />
        <a href="/cd" className="btn btn-ghost">← Voltar</a>
      </div>

      <h1 className="text-2xl font-bold mb-1">📦 Rota de Separação</h1>
      <p className="text-sm text-slate-600 mb-4">
        {pedidos.length} pedido(s) em {grupos.size} cidade(s) — gerado em {new Date().toLocaleString('pt-BR')}
      </p>

      {grupos.size === 0 ? (
        <p className="text-slate-500">Nenhum pedido pra separar no momento.</p>
      ) : (
        Array.from(grupos.entries()).map(([cidade, lista]) => {
          const totalCidade = lista.reduce((s, p) => s + p.total, 0);
          return (
            <div key={cidade} className="rota mb-6 border-2 border-black">
              <div className="bg-black text-white p-2 flex items-center justify-between">
                <h2 className="font-bold">📍 {cidade}</h2>
                <span>{lista.length} pedido(s) · {brl(totalCidade)}</span>
              </div>
              {lista.map((p) => (
                <div key={p.id} className="p-3 border-b border-black last:border-b-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-lg">#{p.numero} — {p.cliente.nome}</p>
                      <p className="text-sm">{p.cliente.endereco}{p.cliente.bairro && `, ${p.cliente.bairro}`}</p>
                      {p.cliente.email && <p className="text-sm">Email: {p.cliente.email}</p>}
                      <p className="text-xs text-slate-600">
                        Vendedor: {p.vendedor.nome} · {new Date(p.data).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{brl(p.total)}</p>
                      <p className="text-xs">
                        {p.status === 'ENVIADO' ? '🆕 Separar' : '⏳ Em separação'}
                      </p>
                    </div>
                  </div>
                  <table className="w-full mt-2 text-sm">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="text-left py-1 w-12">Qtd</th>
                        <th className="text-left py-1">Produto</th>
                        <th className="text-right w-20">Total</th>
                        <th className="text-center w-12">✓</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.itens.map((i) => (
                        <tr key={i.id} className="border-b border-gray-300">
                          <td className="py-1">{Number(i.quantidade)}</td>
                          <td className="py-1">
                            Produto #{i.produtoId}
                            {i.observacao && <div className="text-xs italic">{i.observacao}</div>}
                          </td>
                          <td className="text-right">{brl(Number(i.total))}</td>
                          <td className="text-center">☐</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {p.observacoes && (
                    <p className="text-xs italic mt-1 bg-yellow-50 p-1">
                      📝 {p.observacoes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}
import { prisma } from '../../../../lib/prisma';
import { buscarSessao } from '../../../../lib/auth';
import { redirect, notFound } from 'next/navigation';
import { brl } from '../../../../lib/format';
import Link from 'next/link';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { PrintButton } from '../../../../components/print-button';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');

  const pedido = await prisma.pedido.findUnique({
    where: { id: params.id },
    include: {
      cliente: true,
      vendedor: true,
      itens: { include: { produto: true } },
    },
  });
  if (!pedido) notFound();

  let contatos: any[] = [];
  try { if (pedido.cliente.contatos) contatos = JSON.parse(pedido.cliente.contatos); } catch {}
  const primeiroContato = contatos[0] || {};

  const subtotal = pedido.itens.reduce((s, i) => s + Number(i.total), 0);
  const desconto = pedido.desconto || 0;
  const total = pedido.total;
  const numeroFormatado = pedido.numero.toString().padStart(6, '0');

  return (
    <>
      <style>{`
        /* SEMPRE BRANCO E PRETO - SEM PREENCHIMENTO */
        html, body { background: #ffffff !important; color: #000000 !important; color-scheme: light !important; }

        @page { size: A4; margin: 12mm; }
        @media print {
          .no-print { display: none !important; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #000 !important; margin: 0; padding: 0; background: #fff !important; }
          .print-page { padding: 0 !important; margin: 0 !important; max-width: 100% !important; box-shadow: none !important; border-radius: 0 !important; }
          table { page-break-inside: auto; border-collapse: collapse; }
          tr, .item-row { page-break-inside: avoid; }
        }
        @media screen {
          body { background: #e2e8f0 !important; }
          .print-page { max-width: 800px; margin: 24px auto; background: #ffffff !important; box-shadow: 0 10px 40px rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden; }
        }
      `}</style>

      <div className="min-h-screen">
        <div className="no-print p-4 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 sticky top-0 bg-slate-100 z-20 border-b border-slate-200">
          <Button asChild variant="outline">
            <Link href={`/pedidos/${pedido.id}`}><ArrowLeft className="w-4 h-4" />Voltar</Link>
          </Button>
          <PrintButton className="flex-1 sm:flex-none" />
          <Button asChild variant="outline">
            <Link href={`/pedidos/${pedido.id}/whatsapp`}><MessageCircle className="w-4 h-4" />WhatsApp</Link>
          </Button>
        </div>

        <div className="print-page">
          {/* === CABEÇALHO: só texto + borda, sem preenchimento === */}
          <div className="px-6 pt-6 pb-3" style={{ borderBottom: '2px solid #000' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center text-3xl font-black" style={{ border: '2px solid #000' }}>
                  A
                </div>
                <div>
                  <div className="text-2xl font-black tracking-tight" style={{ color: '#000' }}>ALM DISTRIBUIDORA</div>
                  <div className="text-xs" style={{ color: '#000' }}>Pedido de Venda</div>
                </div>
              </div>
              <div className="text-right text-xs" style={{ color: '#000' }}>
                <div>📞 (32) 99976-2176</div>
                <div>✉️ almdistribuidora@hotmail.com.br</div>
                <div>📍 Ubá — MG</div>
              </div>
            </div>
          </div>

          {/* === TÍTULO + DATA === */}
          <div className="px-6 py-4 flex items-end justify-between" style={{ borderBottom: '1px solid #000' }}>
            <div>
              <p className="text-xs uppercase font-bold" style={{ color: '#000', letterSpacing: '0.1em' }}>Pedido Nº</p>
              <p className="text-3xl font-black font-mono" style={{ color: '#000' }}>#{numeroFormatado}</p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase font-bold" style={{ color: '#000', letterSpacing: '0.1em' }}>Data</p>
              <p className="text-lg font-bold" style={{ color: '#000' }}>{new Date(pedido.data).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          {/* === DADOS DO CLIENTE === */}
          <div className="px-6 py-4" style={{ borderBottom: '1px solid #000' }}>
            <p className="text-xs uppercase font-bold mb-2" style={{ color: '#000', letterSpacing: '0.1em' }}>Cliente</p>
            <p className="text-xl font-black mb-1" style={{ color: '#000' }}>{pedido.cliente.nome}</p>
            {pedido.cliente.nomeFantasia && pedido.cliente.nomeFantasia !== pedido.cliente.nome && (
              <p className="text-sm mb-2" style={{ color: '#000' }}>{pedido.cliente.nomeFantasia}</p>
            )}
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs" style={{ color: '#000' }}>
              {pedido.cliente.cpfCnpj && (
                <div><b>{pedido.cliente.tipo === 'PESSOA_FISICA' ? 'CPF' : 'CNPJ'}:</b> {pedido.cliente.cpfCnpj}</div>
              )}
              {primeiroContato.nome && (
                <div><b>Contato:</b> {primeiroContato.nome}{primeiroContato.cargo && ` (${primeiroContato.cargo})`}</div>
              )}
              {primeiroContato.telefone && (
                <div><b>Telefone:</b> {primeiroContato.telefone}</div>
              )}
              {pedido.cliente.email && (
                <div><b>E-mail:</b> {pedido.cliente.email}</div>
              )}
              {(pedido.cliente.endereco || pedido.cliente.cidade) && (
                <div className="col-span-2">
                  <b>Endereço:</b>{' '}
                  {pedido.cliente.endereco}
                  {pedido.cliente.numero && `, ${pedido.cliente.numero}`}
                  {pedido.cliente.complemento && `, ${pedido.cliente.complemento}`}
                  {pedido.cliente.bairro && ` — ${pedido.cliente.bairro}`}
                  {pedido.cliente.cidade && ` — ${pedido.cliente.cidade}/${pedido.cliente.estado}`}
                  {pedido.cliente.cep && ` — CEP ${pedido.cliente.cep}`}
                </div>
              )}
              <div><b>Vendedor:</b> {pedido.vendedor.nome.split(' (')[0]}</div>
            </div>
          </div>

          {/* === TABELA DE ITENS (sem preenchimento, só bordas) === */}
          <div className="px-6 pt-4">
            <p className="text-xs uppercase font-bold mb-2" style={{ color: '#000', letterSpacing: '0.1em' }}>Itens do Pedido</p>
          </div>
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th className="p-2 text-center" style={{ color: '#000', width: '32px', borderBottom: '2px solid #000', borderTop: '1px solid #000' }}>#</th>
                <th className="p-2 text-center" style={{ color: '#000', width: '60px', borderBottom: '2px solid #000', borderTop: '1px solid #000' }}>Qtd</th>
                <th className="p-2 text-center" style={{ color: '#000', width: '40px', borderBottom: '2px solid #000', borderTop: '1px solid #000' }}>Un</th>
                <th className="p-2 text-left" style={{ color: '#000', borderBottom: '2px solid #000', borderTop: '1px solid #000' }}>Produto</th>
                <th className="p-2 text-right" style={{ color: '#000', width: '90px', borderBottom: '2px solid #000', borderTop: '1px solid #000' }}>Unitário</th>
                <th className="p-2 text-right" style={{ color: '#000', width: '100px', borderBottom: '2px solid #000', borderTop: '1px solid #000' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {pedido.itens.map((i, idx) => (
                <tr key={i.id} className="item-row">
                  <td className="p-2 text-center" style={{ color: '#000', borderBottom: '1px solid #ddd' }}>{idx + 1}</td>
                  <td className="p-2 text-center font-bold font-mono" style={{ color: '#000', borderBottom: '1px solid #ddd' }}>{Number(i.quantidade)}</td>
                  <td className="p-2 text-center" style={{ color: '#000', borderBottom: '1px solid #ddd', fontSize: '11px' }}>{i.produto.unidade}</td>
                  <td className="p-2" style={{ color: '#000', borderBottom: '1px solid #ddd' }}>
                    <p className="font-bold" style={{ color: '#000' }}>{i.produto.nome}</p>
                    {i.observacao && <p className="text-xs italic" style={{ color: '#000' }}>↳ {i.observacao}</p>}
                  </td>
                  <td className="p-2 text-right font-mono" style={{ color: '#000', borderBottom: '1px solid #ddd' }}>{Number(i.precoUnit).toFixed(2).replace('.', ',')}</td>
                  <td className="p-2 text-right font-bold font-mono" style={{ color: '#000', borderBottom: '1px solid #ddd' }}>{Number(i.total).toFixed(2).replace('.', ',')}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 12 - pedido.itens.length) }).map((_, idx) => (
                <tr key={`empty-${idx}`}>
                  <td className="p-2 text-center" style={{ color: '#bbb', borderBottom: '1px solid #ddd' }}>{pedido.itens.length + idx + 1}</td>
                  <td className="p-2" style={{ borderBottom: '1px solid #ddd' }}>&nbsp;</td>
                  <td className="p-2" style={{ borderBottom: '1px solid #ddd' }}>&nbsp;</td>
                  <td className="p-2" style={{ borderBottom: '1px solid #ddd' }}>&nbsp;</td>
                  <td className="p-2" style={{ borderBottom: '1px solid #ddd' }}>&nbsp;</td>
                  <td className="p-2" style={{ borderBottom: '1px solid #ddd' }}>&nbsp;</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* === TOTAIS (sem preenchimento) === */}
          <div className="flex justify-end px-6 pt-3 pb-4">
            <div className="w-72" style={{ border: '1px solid #000' }}>
              {desconto > 0 && (
                <div className="flex justify-between p-2 text-sm" style={{ color: '#000', borderBottom: '1px solid #000' }}>
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">{brl(subtotal)}</span>
                </div>
              )}
              {desconto > 0 && (
                <div className="flex justify-between p-2 text-sm" style={{ color: '#000', borderBottom: '1px solid #000' }}>
                  <span>Desconto</span>
                  <span className="font-mono font-bold">− {brl(desconto)}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3" style={{ borderTop: desconto > 0 ? '0' : '2px solid #000', borderTopWidth: '2px', borderTopColor: '#000' }}>
                <span className="text-sm font-black uppercase" style={{ color: '#000', letterSpacing: '0.1em' }}>TOTAL</span>
                <span className="text-xl font-black font-mono" style={{ color: '#000' }}>{brl(total)}</span>
              </div>
            </div>
          </div>

          {/* === CONDIÇÃO DE PAGAMENTO === */}
          <div className="mx-6 mb-3 p-3" style={{ border: '1px solid #000' }}>
            <p className="text-xs uppercase font-bold" style={{ color: '#000', letterSpacing: '0.1em' }}>Condição de Pagamento</p>
            <p className="text-base font-bold mt-0.5" style={{ color: '#000' }}>{pedido.condicaoPgto || 'A combinar'}</p>
          </div>

          {/* === OBSERVAÇÕES === */}
          {pedido.observacoes && (
            <div className="mx-6 mb-4 p-3" style={{ border: '1px solid #000' }}>
              <p className="text-xs uppercase font-bold" style={{ color: '#000', letterSpacing: '0.1em' }}>Observações</p>
              <p className="text-sm mt-1" style={{ color: '#000' }}>{pedido.observacoes}</p>
            </div>
          )}

          {/* === ASSINATURAS === */}
          <div className="grid grid-cols-2 mt-4" style={{ borderTop: '1px solid #000' }}>
            <div className="p-4" style={{ borderRight: '1px solid #000' }}>
              <div className="pt-2 mt-8 text-center" style={{ borderTop: '1px solid #000' }}>
                <p className="text-sm font-bold" style={{ color: '#000' }}>{pedido.vendedor.nome.split(' (')[0]}</p>
                <p className="text-[10px]" style={{ color: '#000' }}>Vendedor · ALM Distribuidora</p>
              </div>
            </div>
            <div className="p-4">
              <div className="pt-2 mt-8 text-center" style={{ borderTop: '1px solid #000' }}>
                <p className="text-sm font-bold" style={{ color: '#000' }}>{pedido.cliente.nome}</p>
                <p className="text-[10px]" style={{ color: '#000' }}>Cliente · Recebi o pedido acima</p>
              </div>
            </div>
          </div>

          {/* === RODAPÉ (texto pequeno, sem preenchimento) === */}
          <div className="text-center py-3 text-[10px]" style={{ color: '#000', borderTop: '1px solid #000' }}>
            <p>ALM Distribuidora · Documento gerado em {new Date().toLocaleString('pt-BR')} · Pedido #{numeroFormatado}</p>
          </div>
        </div>
      </div>
    </>
  );
}

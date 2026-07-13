import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';
import { redirect, notFound } from 'next/navigation';
import { brl, STATUS_COR, STATUS_LABEL } from '../../../lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { ArrowLeft, Edit, MapPin, Mail, Phone, CreditCard, FileText, Plus, Tag, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      pedidos: {
        orderBy: { data: 'desc' },
        take: 20,
        include: { itens: { include: { produto: true } } },
      },
    },
  });
  if (!cliente) notFound();

  let contatos: any[] = [];
  try { if (cliente.contatos) contatos = JSON.parse(cliente.contatos); } catch {}

  const contagem = new Map<string, { nome: string; qtd: number; receita: number }>();
  for (const p of cliente.pedidos) {
    for (const i of p.itens) {
      const k = i.produto.nome;
      if (!contagem.has(k)) contagem.set(k, { nome: k, qtd: 0, receita: 0 });
      const item = contagem.get(k)!;
      item.qtd += Number(i.quantidade);
      item.receita += Number(i.total);
    }
  }
  const topProdutos = Array.from(contagem.values()).sort((a, b) => b.qtd - a.qtd).slice(0, 5);

  const totalGasto = cliente.pedidos.reduce((s, p) => s + p.total, 0);
  const ticketMedio = cliente.pedidos.length > 0 ? totalGasto / cliente.pedidos.length : 0;
  const ultimoPedido = cliente.pedidos[0];
  const diasSemComprar = ultimoPedido
    ? Math.floor((Date.now() - new Date(ultimoPedido.data).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const tags = cliente.tags ? cliente.tags.split(',').filter(Boolean) : [];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button asChild variant="ghost" size="sm">
          <Link href="/clientes"><ArrowLeft className="w-4 h-4" />Voltar</Link>
        </Button>
        <div className="flex gap-2">
          <Button asChild variant="accent" size="sm">
            <Link href={`/pedidos/novo?cliente=${cliente.id}`}><Plus className="w-4 h-4" />Novo pedido</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/clientes/${cliente.id}/editar`}><Edit className="w-4 h-4" />Editar</Link>
          </Button>
        </div>
      </div>

      {/* Cabeçalho do cliente */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden shrink-0">
              {cliente.foto ? (
                <img src={cliente.foto} alt={cliente.nome} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-slate-400">{cliente.nome.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 truncate">
                  {cliente.nome}
                </h1>
                {cliente.statusFinanc === 'INADIMPLENTE' && <Badge variant="danger">Inadimplente</Badge>}
                {cliente.statusFinanc === 'BLOQUEADO' && <Badge variant="danger">Bloqueado</Badge>}
                {cliente.statusFinanc === 'ATIVO' && <Badge variant="success">Ativo</Badge>}
              </div>
              {cliente.nomeFantasia && cliente.nomeFantasia !== cliente.nome && (
                <p className="text-sm text-slate-500">{cliente.nomeFantasia}</p>
              )}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary"><Tag className="w-2.5 h-2.5 mr-0.5" />{t.trim()}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Pedidos</p>
            <p className="text-2xl font-black mt-1">{cliente.pedidos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Total gasto</p>
            <p className="text-lg font-black mt-1 text-green-600">{brl(totalGasto)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Ticket médio</p>
            <p className="text-lg font-black mt-1">{brl(ticketMedio)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Última compra</p>
            <p className="text-lg font-black mt-1">
              {ultimoPedido ? `${diasSemComprar}d` : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {diasSemComprar !== null && diasSemComprar > 30 && (
        <Card className="border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <b>Cliente sumido</b> — {diasSemComprar} dias sem comprar. Vale uma visita.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Dados */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(cliente.endereco || cliente.cidade) && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  {cliente.endereco && <div>{cliente.endereco}{cliente.numero && `, ${cliente.numero}`}</div>}
                  {cliente.complemento && <div className="text-slate-500">{cliente.complemento}</div>}
                  <div>{cliente.bairro} — {cliente.cidade}/{cliente.estado}</div>
                  {cliente.cep && <div className="text-xs text-slate-500">CEP: {cliente.cep}</div>}
                </div>
              </div>
            )}
            {cliente.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <a href={`mailto:${cliente.email}`} className="hover:underline">{cliente.email}</a>
              </div>
            )}
            {cliente.cpfCnpj && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                <span><span className="text-xs text-slate-500">{cliente.tipo === 'PESSOA_FISICA' ? 'CPF' : 'CNPJ'}:</span> {cliente.cpfCnpj}</span>
              </div>
            )}
            {cliente.condicaoPgto && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>{cliente.condicaoPgto}</span>
              </div>
            )}
            {cliente.limiteCredito > 0 && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-400" />
                <span>Limite de crédito: <b>{brl(cliente.limiteCredito)}</b></span>
              </div>
            )}

            {contatos.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 mb-2">CONTATOS</p>
                <div className="space-y-2">
                  {contatos.filter(c => c.nome).map((c, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <p className="font-semibold text-sm">{c.nome} {c.cargo && <span className="text-slate-500 font-normal">— {c.cargo}</span>}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-slate-500 mt-1">
                        {c.telefone && <span>📞 {c.telefone}</span>}
                        {c.email && <span>✉️ {c.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cliente.observacoes && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 mb-1">OBSERVAÇÕES INTERNAS</p>
                <p className="text-sm whitespace-pre-wrap">{cliente.observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top produtos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">⭐ Mais pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {topProdutos.length === 0 ? (
              <p className="text-sm text-slate-500">Sem histórico ainda.</p>
            ) : (
              <ol className="space-y-2">
                {topProdutos.map((p, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate flex-1">
                        <span className="text-slate-400 mr-1">{i + 1}.</span>
                        {p.nome}
                      </span>
                      <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">{p.qtd.toLocaleString('pt-BR')}</span>
                    </div>
                    <p className="text-xs text-slate-500 ml-4">{brl(p.receita)}</p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Histórico de pedidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Histórico de pedidos</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/pedidos?q=${encodeURIComponent(cliente.nome)}`}>Ver todos</Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {cliente.pedidos.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              Nenhum pedido ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {cliente.pedidos.map((p) => (
                <Link
                  key={p.id}
                  href={`/pedidos/${p.id}`}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-sm">#{p.numero}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(p.data).toLocaleDateString('pt-BR')} · {p.itens.length} itens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{brl(p.total)}</p>
                    <Badge variant={STATUS_COR[p.status] === 'bg-blue-100 text-blue-700' ? 'info' : STATUS_COR[p.status] === 'bg-green-100 text-green-700' ? 'success' : 'secondary'} className="mt-1">
                      {STATUS_LABEL[p.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

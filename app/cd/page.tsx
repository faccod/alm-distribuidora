import { prisma } from '../../lib/prisma';
import { getSessao } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PainelClient from './painel-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sessao = getSessao();
  if (!sessao) redirect('/login');
  if (sessao.perfil !== 'CD' && sessao.perfil !== 'GERENTE' && sessao.perfil !== 'ADMIN') {
    return (
      <div className="p-6 text-center">
        <p>Sem permissão.</p>
        <Link href="/" className="text-blue-600 underline">Voltar</Link>
      </div>
    );
  }

  // Pega pedidos relevantes: ativos (enviado, separando, despachado) + entregues recentes
  const pedidos = await prisma.pedido.findMany({
    where: {
      status: { in: ['ENVIADO', 'EM_SEPARACAO', 'DESPACHADO', 'ENTREGUE'] },
    },
    orderBy: { data: 'desc' },
    include: {
      cliente: { select: { nome: true, cidade: true, estado: true } },
      _count: { select: { itens: true } },
    },
    take: 200,
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="text-2xl">📦</span> Painel do CD
          </h1>
          <p className="text-sm text-slate-500">
            Olá {sessao.nome.split(' ')[0]}, {pedidos.length} pedido(s) no sistema
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/cd/rota" target="_blank">
            <Printer className="w-4 h-4" />Imprimir rota completa
          </Link>
        </Button>
      </div>

      <PainelClient
        pedidos={pedidos.map((p) => ({
          id: p.id,
          numero: p.numero,
          data: p.data.toISOString(),
          total: p.total,
          status: p.status,
          condicaoPgto: p.condicaoPgto,
          observacoes: p.observacoes,
          cliente: p.cliente,
          _count: p._count,
        }))}
      />
    </div>
  );
}

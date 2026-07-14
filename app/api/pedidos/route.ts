import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { buscarSessao } from '../../../lib/auth';

export async function GET() {
  const sessao = await buscarSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const pedidos = await prisma.pedido.findMany({
    orderBy: { data: 'desc' },
    include: { cliente: true, vendedor: true, _count: { select: { itens: true } } },
    take: 100,
  });

  return NextResponse.json(pedidos);
}

export async function POST(req: Request) {
  const sessao = await buscarSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  const { clienteId, vendedorId, condicaoPgto, observacoes, itens, status, offlineId } = body;

  if (!clienteId || !vendedorId || !itens || itens.length === 0) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  // Próximo número de pedido
  const ultimo = await prisma.pedido.findFirst({ orderBy: { numero: 'desc' } });
  const proximoNumero = (ultimo?.numero ?? 0) + 1;

  // Calcula total
  let total = 0;
  for (const i of itens) {
    total += Number(i.quantidade) * Number(i.precoUnit);
  }

  const pedido = await prisma.pedido.create({
    data: {
      numero: proximoNumero,
      clienteId,
      vendedorId,
      condicaoPgto: condicaoPgto || null,
      observacoes: observacoes || null,
      status: status || 'RASCUNHO',
      total,
      itens: {
        create: itens.map((i: any) => ({
          produtoId: i.produtoId,
          quantidade: Number(i.quantidade),
          precoUnit: Number(i.precoUnit),
          observacao: i.observacao || null,
          total: Number(i.quantidade) * Number(i.precoUnit),
        })),
      },
    },
  });

  await prisma.historicoPedido.create({
    data: {
      pedidoId: pedido.id,
      status: pedido.status,
      usuario: sessao.nome,
    },
  });

  return NextResponse.json({ id: pedido.id, numero: pedido.numero });
}
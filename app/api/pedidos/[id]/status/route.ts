import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { buscarSessao } from '../../../../../lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { status } = await req.json();
  const permitidos = ['RASCUNHO', 'ENVIADO', 'EM_SEPARACAO', 'DESPACHADO', 'ENTREGUE', 'CANCELADO'];
  if (!permitidos.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
  }

  const pedido = await prisma.pedido.update({
    where: { id: params.id },
    data: { status },
  });

  await prisma.historicoPedido.create({
    data: { pedidoId: pedido.id, status, usuario: sessao.nome },
  });

  return NextResponse.json({ ok: true, status: pedido.status });
}

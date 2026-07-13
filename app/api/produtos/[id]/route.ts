import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getSessao } from '../../../../lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  const body = await req.json();
  if (!body.nome || !body.categoriaId) {
    return NextResponse.json({ error: 'Nome e categoria são obrigatórios' }, { status: 400 });
  }

  const produto = await prisma.produto.update({
    where: { id },
    data: {
      nome: body.nome,
      descricao: body.descricao || null,
      sku: body.sku || null,
      codigoBarras: body.codigoBarras || null,
      categoriaId: Number(body.categoriaId),
      marcaId: body.marcaId ? Number(body.marcaId) : null,
      unidade: body.unidade || 'UN',
      unidadesPorEmbalagem: body.unidadesPorEmbalagem ? Number(body.unidadesPorEmbalagem) : null,
      precoCusto: Number(body.precoCusto) || 0,
      precoTabela: Number(body.precoTabela) || 0,
      precoPromocional: body.precoPromocional ? Number(body.precoPromocional) : null,
      estoque: Number(body.estoque) || 0,
      estoqueMinimo: Number(body.estoqueMinimo) || 0,
      destaque: Boolean(body.destaque),
      ativo: body.ativo !== false,
      foto: body.foto || null,
    },
  });
  return NextResponse.json(produto);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

  // Soft delete: só desativa, mantém histórico de pedidos
  await prisma.produto.update({ where: { id }, data: { ativo: false } });
  return NextResponse.json({ ok: true });
}

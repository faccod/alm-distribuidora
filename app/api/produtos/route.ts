import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';

export async function GET(req: Request) {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const cat = url.searchParams.get('cat');

  const produtos = await prisma.produto.findMany({
    where: {
      ativo: true,
      ...(q ? { nome: { contains: q } } : {}),
      ...(cat ? { categoriaId: parseInt(cat) } : {}),
    },
    orderBy: [{ destaque: 'desc' }, { nome: 'asc' }],
    include: { categoria: true, marca: true },
    take: 500,
  });
  return NextResponse.json(produtos);
}

export async function POST(req: Request) {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  if (!body.nome || !body.categoriaId) {
    return NextResponse.json({ error: 'Nome e categoria são obrigatórios' }, { status: 400 });
  }

  const produto = await prisma.produto.create({
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
      foto: body.foto || null,
    },
  });
  return NextResponse.json(produto);
}

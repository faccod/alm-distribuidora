import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';

export async function GET() {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const categorias = await prisma.categoria.findMany({ orderBy: { nome: 'asc' } });
  return NextResponse.json(categorias);
}

export async function POST(req: Request) {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (sessao.perfil === 'VENDEDOR' || sessao.perfil === 'CD') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }
  const { nome, icone, cor } = await req.json();
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
  const cat = await prisma.categoria.create({
    data: {
      nome,
      icone: icone || null,
      cor: cor || null,
    },
  });
  return NextResponse.json(cat);
}

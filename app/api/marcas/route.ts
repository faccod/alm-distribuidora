import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';

export async function GET() {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const marcas = await prisma.marca.findMany({ orderBy: { nome: 'asc' } });
  return NextResponse.json(marcas);
}

export async function POST(req: Request) {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (sessao.perfil === 'VENDEDOR' || sessao.perfil === 'CD') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }
  const { nome } = await req.json();
  if (!nome) return NextResponse.json({ error: 'Nome obrigatório' }, { status: 400 });
  try {
    const marca = await prisma.marca.create({ data: { nome } });
    return NextResponse.json(marca);
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Já existe uma marca com esse nome' }, { status: 409 });
    }
    throw e;
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (sessao.perfil !== 'GERENTE' && sessao.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }
  const usuarios = await prisma.usuario.findMany({ orderBy: { nome: 'asc' } });
  return NextResponse.json(usuarios);
}

export async function POST(req: Request) {
  const sessao = getSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (sessao.perfil !== 'GERENTE' && sessao.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const body = await req.json();
  if (!body.nome || !body.email || !body.senha) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }
  if (body.senha.length < 6) {
    return NextResponse.json({ error: 'Senha precisa ter pelo menos 6 caracteres' }, { status: 400 });
  }

  const existe = await prisma.usuario.findUnique({ where: { email: body.email } });
  if (existe) {
    return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(body.senha, 10);
  const usuario = await prisma.usuario.create({
    data: {
      nome: body.nome,
      email: body.email,
      senhaHash,
      perfil: body.perfil || 'VENDEDOR',
    },
  });

  return NextResponse.json({ id: usuario.id });
}

import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { buscarSessao } from '../../../../lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (sessao.perfil !== 'GERENTE' && sessao.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  const body = await req.json();
  const data: any = {};
  if (typeof body.nome === 'string' && body.nome.trim()) data.nome = body.nome.trim();
  if (typeof body.email === 'string' && body.email.trim()) data.email = body.email.trim().toLowerCase();
  if (body.perfil && ['ADMIN', 'GERENTE', 'VENDEDOR', 'CD'].includes(body.perfil)) data.perfil = body.perfil;
  if (body.ativo !== undefined) data.ativo = Boolean(body.ativo);
  if (typeof body.senha === 'string' && body.senha) {
    if (body.senha.length < 6) {
      return NextResponse.json({ error: 'Senha precisa ter pelo menos 6 caracteres' }, { status: 400 });
    }
    data.senhaHash = await bcrypt.hash(body.senha, 10);
  }

  try {
    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ ok: true, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil, ativo: usuario.ativo } });
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 409 });
    }
    throw e;
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (sessao.perfil !== 'GERENTE' && sessao.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });
  }

  // Não permite desativar a si mesmo
  if (sessao.id === params.id) {
    return NextResponse.json({ error: 'Você não pode desativar seu próprio usuário' }, { status: 400 });
  }

  await prisma.usuario.update({ where: { id: params.id }, data: { ativo: false } });
  return NextResponse.json({ ok: true });
}

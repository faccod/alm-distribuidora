import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { buscarSessao } from '../../../../lib/auth';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const body = await req.json();
  if (!body.nome) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }

  const data: any = {
    nome: body.nome,
    nomeFantasia: body.nomeFantasia || null,
    tipo: body.tipo || 'PESSOA_JURIDICA',
    cpfCnpj: body.cpfCnpj || null,
    inscricaoEstadual: body.inscricaoEstadual || null,
    email: body.email || null,
    site: body.site || null,
    cep: body.cep || null,
    endereco: body.endereco || null,
    numero: body.numero || null,
    complemento: body.complemento || null,
    bairro: body.bairro || null,
    cidade: body.cidade || null,
    estado: body.estado || null,
    contatos: body.contatos || null,
    limiteCredito: Number(body.limiteCredito) || 0,
    condicaoPgto: body.condicaoPgto || null,
    dadosBancarios: body.dadosBancarios || null,
    statusFinanc: body.statusFinanc || 'ATIVO',
    tags: body.tags || null,
    observacoes: body.observacoes || null,
    foto: body.foto || null,
    ativo: body.ativo !== false,
  };

  const cliente = await prisma.cliente.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(cliente);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const sessao = await buscarSessao();
  if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  // Soft delete: mantém histórico
  await prisma.cliente.update({ where: { id: params.id }, data: { ativo: false } });
  return NextResponse.json({ ok: true });
}

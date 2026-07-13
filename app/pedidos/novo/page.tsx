import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import PDVClient from './pdv-client';

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: { cliente?: string } }) {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const [clientes, produtos, categorias] = await Promise.all([
    prisma.cliente.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' },
      select: { id: true, nome: true, nomeFantasia: true, cidade: true, estado: true, condicaoPgto: true },
    }),
    prisma.produto.findMany({
      where: { ativo: true },
      orderBy: [{ destaque: 'desc' }, { nome: 'asc' }],
      include: { categoria: true },
    }),
    prisma.categoria.findMany({ orderBy: { nome: 'asc' } }),
  ]);

  // Se vier ?cliente=ID, pré-seleciona
  const clienteInicial = searchParams.cliente
    ? clientes.find((c) => c.id === searchParams.cliente) || null
    : null;

  return (
    <PDVClient
      clientes={clientes.map((c) => ({
        id: c.id,
        nome: c.nome,
        nomeFantasia: c.nomeFantasia,
        cidade: c.cidade,
        estado: c.estado,
        condicaoPgto: c.condicaoPgto,
      }))}
      produtos={produtos.map((p) => ({
        id: p.id,
        nome: p.nome,
        unidade: p.unidade,
        precoTabela: p.precoTabela,
        categoria: p.categoria,
        estoque: p.estoque,
        foto: p.foto,
        destaque: p.destaque,
      }))}
      categorias={categorias}
      vendedorId={sessao.id}
      clienteInicial={clienteInicial || undefined}
    />
  );
}

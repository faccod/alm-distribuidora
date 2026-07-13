import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import NovoProduto from './novo-produto';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const [categorias, marcas] = await Promise.all([
    prisma.categoria.findMany({ orderBy: { nome: 'asc' } }),
    prisma.marca.findMany({ orderBy: { nome: 'asc' } }),
  ]);

  return <NovoProduto categorias={categorias} marcas={marcas} />;
}

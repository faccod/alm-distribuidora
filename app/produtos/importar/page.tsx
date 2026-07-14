import { prisma } from '../../../lib/prisma';
import { buscarSessao } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ImportarProdutos from './importar';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');
  if (sessao.perfil === 'VENDEDOR' || sessao.perfil === 'CD') {
    return (
      <div className="p-6 text-center">
        <p>Sem permissão.</p>
        <Link href="/" className="text-blue-600 underline">Voltar</Link>
      </div>
    );
  }

  const categorias = await prisma.categoria.findMany({ orderBy: { nome: 'asc' } });
  return <ImportarProdutos categorias={categorias} />;
}
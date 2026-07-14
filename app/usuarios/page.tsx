import { prisma } from '../../lib/prisma';
import { buscarSessao } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { brl } from '../../lib/format';
import Link from 'next/link';
import UsuariosClient from './usuarios-client';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');
  if (sessao.perfil !== 'GERENTE' && sessao.perfil !== 'ADMIN') {
    return (
      <div className="p-6 text-center">
        <p>Sem permissão.</p>
        <Link href="/" className="text-blue-600 underline">Voltar</Link>
      </div>
    );
  }

  const usuarios = await prisma.usuario.findMany({
    orderBy: { nome: 'asc' },
    include: { _count: { select: { pedidos: true } } },
  });

  return (
    <UsuariosClient
      usuarios={usuarios.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        perfil: u.perfil,
        ativo: u.ativo,
        criadoEm: u.criadoEm.toISOString(),
        totalPedidos: u._count.pedidos,
      }))}
    />
  );
}
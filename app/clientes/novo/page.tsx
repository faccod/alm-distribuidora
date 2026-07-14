import { buscarSessao } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import NovoCliente from './novo-cliente';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');
  return <NovoCliente />;
}
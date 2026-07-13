import { getSessao } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import NovoCliente from './novo-cliente';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const sessao = getSessao();
  if (!sessao) redirect('/login');
  return <NovoCliente />;
}

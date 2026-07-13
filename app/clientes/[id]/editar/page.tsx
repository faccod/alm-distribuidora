import { prisma } from '../../../../lib/prisma';
import { getSessao } from '../../../../lib/auth';
import { redirect, notFound } from 'next/navigation';
import EditarCliente from './editar-cliente';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const cliente = await prisma.cliente.findUnique({ where: { id: params.id } });
  if (!cliente) notFound();

  let contatos: any[] = [];
  try {
    if (cliente.contatos) contatos = JSON.parse(cliente.contatos);
  } catch {}
  if (contatos.length === 0) contatos = [{ nome: '', cargo: '', telefone: '', email: '' }];

  return (
    <EditarCliente
      cliente={{
        id: cliente.id,
        nome: cliente.nome,
        nomeFantasia: cliente.nomeFantasia,
        tipo: cliente.tipo,
        cpfCnpj: cliente.cpfCnpj,
        inscricaoEstadual: cliente.inscricaoEstadual,
        email: cliente.email,
        site: cliente.site,
        cep: cliente.cep,
        endereco: cliente.endereco,
        numero: cliente.numero,
        complemento: cliente.complemento,
        bairro: cliente.bairro,
        cidade: cliente.cidade,
        estado: cliente.estado,
        limiteCredito: cliente.limiteCredito,
        condicaoPgto: cliente.condicaoPgto,
        dadosBancarios: cliente.dadosBancarios,
        statusFinanc: cliente.statusFinanc,
        tags: cliente.tags,
        observacoes: cliente.observacoes,
        foto: cliente.foto,
        ativo: cliente.ativo,
        contatos,
      }}
    />
  );
}

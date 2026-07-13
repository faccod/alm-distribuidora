import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';
import { redirect, notFound } from 'next/navigation';
import EditarProduto from './editar-produto';

export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: { id: string } }) {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const [produto, categorias, marcas] = await Promise.all([
    prisma.produto.findUnique({ where: { id } }),
    prisma.categoria.findMany({ orderBy: { nome: 'asc' } }),
    prisma.marca.findMany({ orderBy: { nome: 'asc' } }),
  ]);

  if (!produto) notFound();

  return (
    <EditarProduto
      produto={{
        id: produto.id,
        nome: produto.nome,
        descricao: produto.descricao,
        sku: produto.sku,
        codigoBarras: produto.codigoBarras,
        categoriaId: produto.categoriaId,
        marcaId: produto.marcaId,
        unidade: produto.unidade,
        unidadesPorEmbalagem: produto.unidadesPorEmbalagem,
        precoCusto: produto.precoCusto,
        precoTabela: produto.precoTabela,
        precoPromocional: produto.precoPromocional,
        estoque: produto.estoque,
        estoqueMinimo: produto.estoqueMinimo,
        destaque: produto.destaque,
        ativo: produto.ativo,
        foto: produto.foto,
      }}
      categorias={categorias}
      marcas={marcas}
    />
  );
}

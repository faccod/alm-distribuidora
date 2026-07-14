import { prisma } from '../../lib/prisma';
import { buscarSessao } from '../../lib/auth';
import { redirect } from 'next/navigation';
import { brl } from '../../lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import Link from 'next/link';
import { TrendingUp, ShoppingCart, Users, Package, MapPin, BarChart3, FileText, Download } from 'lucide-react';
import { IconePorNome } from '../../components/categoria-dialog';
import VendasChart from '../../components/vendas-chart';
import VendasCategoriaChart from '../../components/vendas-categoria-chart';
import RelatoriosClient from './relatorios-client';

export const dynamic = 'force-dynamic';

export default async function Relatorios({ searchParams }: { searchParams: any }) {
  const sessao = await buscarSessao();
  if (!sessao) redirect('/login');

  // Parse de filtros
  const periodo = searchParams.periodo || '30d';
  const clienteId = searchParams.cliente || '';
  const categoriaId = searchParams.categoria || '';
  const vendedorId = searchParams.vendedor || '';
  const status = searchParams.status || '';
  const dataIni = searchParams.dataIni || '';
  const dataFim = searchParams.dataFim || '';

  let desde: Date;
  let ate: Date = new Date();
  ate.setHours(23, 59, 59, 999);

  if (dataIni && dataFim) {
    desde = new Date(dataIni + 'T00:00:00');
    ate = new Date(dataFim + 'T23:59:59');
  } else {
    const dias = parseInt(periodo.replace('d', '')) || 30;
    desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
  }

  // Carrega dados de filtros
  const [clientes, categorias, vendedores] = await Promise.all([
    prisma.cliente.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' }, select: { id: true, nome: true } }),
    prisma.categoria.findMany({ orderBy: { nome: 'asc' } }),
    prisma.usuario.findMany({ where: { ativo: true, perfil: { in: ['VENDEDOR', 'GERENTE', 'ADMIN'] } }, orderBy: { nome: 'asc' } }),
  ]);

  // Query de pedidos filtrados
  const where: any = {
    data: { gte: desde, lte: ate },
    status: { not: 'CANCELADO' },
  };
  if (clienteId) where.clienteId = clienteId;
  if (vendedorId) where.vendedorId = vendedorId;
  if (status) where.status = status;
  if (categoriaId) where.itens = { some: { produto: { categoriaId: Number(categoriaId) } } };

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      cliente: { select: { nome: true, cidade: true, estado: true } },
      vendedor: { select: { nome: true } },
      itens: { include: { produto: { include: { categoria: true, marca: true } } } },
    },
  });

  // KPIs
  const totalVendas = pedidos.reduce((s, p) => s + p.total, 0);
  const totalPedidos = pedidos.length;
  const clientesUnicos = new Set(pedidos.map((p) => p.clienteId)).size;
  const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;
  const itensTotais = pedidos.reduce((s, p) => s + p.itens.length, 0);

  // Vendas por dia
  const mapaDias = new Map<string, { total: number; pedidos: number }>();
  for (const p of pedidos) {
    const k = new Date(p.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (!mapaDias.has(k)) mapaDias.set(k, { total: 0, pedidos: 0 });
    const m = mapaDias.get(k)!;
    m.total += p.total;
    m.pedidos += 1;
  }
  const vendasPorDia = Array.from(mapaDias.entries())
    .map(([data, v]) => ({ data, ...v }))
    .sort((a, b) => a.data.localeCompare(b.data));

  // Vendas por cidade
  const mapaCidades = new Map<string, { cidade: string; uf: string; total: number; pedidos: number; clientes: Set<string> }>();
  for (const p of pedidos) {
    const chave = `${p.cliente.cidade || '?'}/${p.cliente.estado || '?'}`;
    if (!mapaCidades.has(chave)) {
      mapaCidades.set(chave, { cidade: p.cliente.cidade || '?', uf: p.cliente.estado || '?', total: 0, pedidos: 0, clientes: new Set() });
    }
    const m = mapaCidades.get(chave)!;
    m.total += p.total;
    m.pedidos += 1;
    m.clientes.add(p.clienteId);
  }
  const vendasPorCidade = Array.from(mapaCidades.values())
    .map((c) => ({ ...c, clientesUnicos: c.clientes.size }))
    .sort((a, b) => b.total - a.total);

  // Vendas por cliente
  const mapaClientes = new Map<string, { nome: string; cidade: string; total: number; pedidos: number }>();
  for (const p of pedidos) {
    if (!mapaClientes.has(p.clienteId)) {
      mapaClientes.set(p.clienteId, { nome: p.cliente.nome, cidade: p.cliente.cidade || '?', total: 0, pedidos: 0 });
    }
    const m = mapaClientes.get(p.clienteId)!;
    m.total += p.total;
    m.pedidos += 1;
  }
  const topClientes = Array.from(mapaClientes.values()).sort((a, b) => b.total - a.total).slice(0, 20);

  // Vendas por produto
  const mapaProdutos = new Map<string, { nome: string; categoria: string; cor: string | null; quantidade: number; receita: number }>();
  for (const p of pedidos) {
    for (const i of p.itens) {
      const k = i.produto.nome;
      if (!mapaProdutos.has(k)) {
        mapaProdutos.set(k, {
          nome: i.produto.nome,
          categoria: i.produto.categoria.nome,
          cor: i.produto.categoria.cor,
          quantidade: 0,
          receita: 0,
        });
      }
      const m = mapaProdutos.get(k)!;
      m.quantidade += Number(i.quantidade);
      m.receita += Number(i.total);
    }
  }
  const topProdutos = Array.from(mapaProdutos.values()).sort((a, b) => b.receita - a.receita).slice(0, 20);

  // Vendas por categoria (para gráfico de pizza/barras)
  const mapaCat = new Map<string, { nome: string; cor: string | null; receita: number; itens: number }>();
  for (const p of pedidos) {
    for (const i of p.itens) {
      const k = i.produto.categoria.nome;
      if (!mapaCat.has(k)) {
        mapaCat.set(k, { nome: k, cor: i.produto.categoria.cor, receita: 0, itens: 0 });
      }
      const m = mapaCat.get(k)!;
      m.receita += Number(i.total);
      m.itens += Number(i.quantidade);
    }
  }
  const vendasPorCategoria = Array.from(mapaCat.values()).sort((a, b) => b.receita - a.receita);

  // Vendas por vendedor
  const mapaVendedores = new Map<string, { nome: string; total: number; pedidos: number }>();
  for (const p of pedidos) {
    if (!mapaVendedores.has(p.vendedorId)) {
      mapaVendedores.set(p.vendedorId, { nome: p.vendedor.nome, total: 0, pedidos: 0 });
    }
    const m = mapaVendedores.get(p.vendedorId)!;
    m.total += p.total;
    m.pedidos += 1;
  }
  const vendasPorVendedor = Array.from(mapaVendedores.values()).sort((a, b) => b.total - a.total);

  // Vendas por status
  const mapaStatus: Record<string, number> = {};
  for (const p of pedidos) {
    mapaStatus[p.status] = (mapaStatus[p.status] || 0) + 1;
  }

  return (
    <RelatoriosClient
      filtros={{
        periodo,
        clienteId,
        categoriaId,
        vendedorId,
        status,
        dataIni,
        dataFim,
      }}
      opcoes={{
        clientes,
        categorias,
        vendedores,
      }}
      kpis={{
        totalVendas,
        totalPedidos,
        clientesUnicos,
        ticketMedio,
        itensTotais,
      }}
      dados={{
        vendasPorDia,
        vendasPorCidade,
        topClientes,
        topProdutos,
        vendasPorCategoria,
        vendasPorVendedor,
        mapaStatus,
      }}
    />
  );
}
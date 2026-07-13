// Seed profissional - dados reais do pedido 21 da ALM
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpar tudo
  await prisma.historicoPedido.deleteMany();
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.marca.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();

  // === CATEGORIAS com cor e ícone ===
  const catCigarro = await prisma.categoria.create({ data: { nome: 'Cigarros', icone: 'cigarette', cor: '#dc2626', ordem: 1 } });
  const catSaco = await prisma.categoria.create({ data: { nome: 'Sacos & Embalagens', icone: 'package', cor: '#0891b2', ordem: 2 } });
  const catSeda = await prisma.categoria.create({ data: { nome: 'Sedas & Papéis', icone: 'file-text', cor: '#7c3aed', ordem: 3 } });
  const catPiteira = await prisma.categoria.create({ data: { nome: 'Piteiras', icone: 'circle', cor: '#16a34a', ordem: 4 } });
  const catPalha = await prisma.categoria.create({ data: { nome: 'Fumo Desfiado', icone: 'flame', cor: '#ea580c', ordem: 5 } });

  // === MARCAS ===
  const marcaTchau = await prisma.marca.create({ data: { nome: 'Tchau' } });
  const marca3Lobos = await prisma.marca.create({ data: { nome: '3 Lobos' } });
  const marcaMandelle = await prisma.marca.create({ data: { nome: 'Mandelle' } });
  const marcaSouzaPaiol = await prisma.marca.create({ data: { nome: 'Souza Paiol' } });
  const marcaOz = await prisma.marca.create({ data: { nome: 'O2' } });
  const marcaSabiá = await prisma.marca.create({ data: { nome: 'Sabiá' } });
  const marcaVieira = await prisma.marca.create({ data: { nome: 'Palha Vieira' } });
  const marcaPapagaio = await prisma.marca.create({ data: { nome: 'Papagaio' } });

  // === PRODUTOS ===
  const produtos = [
    { nome: 'Cigarro Tchau Brigadu Ice', categoriaId: catCigarro.id, marcaId: marcaTchau.id, unidade: 'CX', precoCusto: 132.0, precoTabela: 165.0, estoque: 45, estoqueMinimo: 10, destaque: true },
    { nome: 'Cigarro Tchau Brigadu Melancia', categoriaId: catCigarro.id, marcaId: marcaTchau.id, unidade: 'CX', precoCusto: 144.0, precoTabela: 180.0, estoque: 30, estoqueMinimo: 10, destaque: true },
    { nome: 'Cigarro Tchau Brigadu Uva', categoriaId: catCigarro.id, marcaId: marcaTchau.id, unidade: 'CX', precoCusto: 120.0, precoTabela: 150.0, estoque: 25, estoqueMinimo: 10 },
    { nome: 'Cigarro Tchau Brigadu Menta', categoriaId: catCigarro.id, marcaId: marcaTchau.id, unidade: 'CX', precoCusto: 120.0, precoTabela: 150.0, estoque: 18, estoqueMinimo: 10 },
    { nome: 'Cigarro Tchau Brigadu Premium', categoriaId: catCigarro.id, marcaId: marcaTchau.id, unidade: 'CX', precoCusto: 120.0, precoTabela: 150.0, estoque: 22, estoqueMinimo: 10 },
    { nome: 'Cigarro 3 Lobos Original', categoriaId: catCigarro.id, marcaId: marca3Lobos.id, unidade: 'CX', precoCusto: 104.0, precoTabela: 130.0, estoque: 40, estoqueMinimo: 15 },
    { nome: 'Cigarro Mandelle', categoriaId: catCigarro.id, marcaId: marcaMandelle.id, unidade: 'CX', precoCusto: 145.6, precoTabela: 182.0, estoque: 15, estoqueMinimo: 8 },
    { nome: 'Cigarro Souza Paiol Tradicional', categoriaId: catCigarro.id, marcaId: marcaSouzaPaiol.id, unidade: 'CX', precoCusto: 110.4, precoTabela: 138.0, estoque: 35, estoqueMinimo: 12 },
    { nome: 'Crédito Cigarro argola Preta', categoriaId: catCigarro.id, unidade: 'PCT', precoCusto: 120.0, precoTabela: 150.0, estoque: 5 },
    { nome: 'Sacola Reciclada Preta 30x40', categoriaId: catSaco.id, unidade: 'PCT', precoCusto: 49.0, precoTabela: 70.0, estoque: 100, estoqueMinimo: 30, unidadesPorEmbalagem: 100 },
    { nome: 'Sacola Reciclada Preta 40x50', categoriaId: catSaco.id, unidade: 'PCT', precoCusto: 49.0, precoTabela: 70.0, estoque: 80, estoqueMinimo: 30, unidadesPorEmbalagem: 100 },
    { nome: 'Sacola Reciclada Preta 50x60', categoriaId: catSaco.id, unidade: 'PCT', precoCusto: 49.0, precoTabela: 70.0, estoque: 60, estoqueMinimo: 30, unidadesPorEmbalagem: 100 },
    { nome: 'Saco Alvejado', categoriaId: catSaco.id, unidade: 'UN', precoCusto: 3.85, precoTabela: 5.5, estoque: 500, estoqueMinimo: 100 },
    { nome: 'Saco de Lixo Preto 15L', categoriaId: catSaco.id, unidade: 'RL', precoCusto: 4.9, precoTabela: 7.0, estoque: 200, estoqueMinimo: 50 },
    { nome: 'Papel Toalha Branco c/1000un', categoriaId: catSaco.id, unidade: 'PCT', precoCusto: 8.05, precoTabela: 11.5, estoque: 90, estoqueMinimo: 20 },
    { nome: 'Saco Papel 1/2kg', categoriaId: catSaco.id, unidade: 'PCT', precoCusto: 10.5, precoTabela: 15.0, estoque: 70, estoqueMinimo: 20 },
    { nome: 'Saco Papel 2kg', categoriaId: catSaco.id, unidade: 'PCT', precoCusto: 19.6, precoTabela: 28.0, estoque: 50, estoqueMinimo: 15 },
    { nome: 'Papel P/ Cigarro Papagaio', categoriaId: catSeda.id, marcaId: marcaPapagaio.id, unidade: 'CX', precoCusto: 24.5, precoTabela: 35.0, estoque: 40, estoqueMinimo: 15 },
    { nome: 'Seda O2 Brown Large', categoriaId: catSeda.id, marcaId: marcaOz.id, unidade: 'CX', precoCusto: 31.5, precoTabela: 45.0, estoque: 60, estoqueMinimo: 20 },
    { nome: 'Seda O2 Brown Slim', categoriaId: catSeda.id, marcaId: marcaOz.id, unidade: 'CX', precoCusto: 31.5, precoTabela: 45.0, estoque: 55, estoqueMinimo: 20 },
    { nome: 'Seda O2 Verde', categoriaId: catSeda.id, marcaId: marcaOz.id, unidade: 'CX', precoCusto: 31.5, precoTabela: 45.0, estoque: 45, estoqueMinimo: 20 },
    { nome: 'Seda O2 Longa', categoriaId: catSeda.id, marcaId: marcaOz.id, unidade: 'CX', precoCusto: 35.0, precoTabela: 50.0, estoque: 30, estoqueMinimo: 15 },
    { nome: 'Piteira O2 Vermelha Large', categoriaId: catPiteira.id, marcaId: marcaOz.id, unidade: 'CX', precoCusto: 45.5, precoTabela: 65.0, estoque: 25, estoqueMinimo: 10 },
    { nome: 'Piteira O2 Azul Large', categoriaId: catPiteira.id, marcaId: marcaOz.id, unidade: 'CX', precoCusto: 45.5, precoTabela: 65.0, estoque: 28, estoqueMinimo: 10 },
    { nome: 'Desfiado Sabiá 36gr', categoriaId: catPalha.id, marcaId: marcaSabiá.id, unidade: 'PCT', precoCusto: 70.0, precoTabela: 100.0, estoque: 35, estoqueMinimo: 15 },
    { nome: 'Desfiado Vieira 37gr', categoriaId: catPalha.id, marcaId: marcaVieira.id, unidade: 'PCT', precoCusto: 70.0, precoTabela: 100.0, estoque: 22, estoqueMinimo: 10 },
    { nome: 'Desfiado Papagaio 36gr', categoriaId: catPalha.id, marcaId: marcaPapagaio.id, unidade: 'PCT', precoCusto: 70.0, precoTabela: 100.0, estoque: 18, estoqueMinimo: 10 },
    { nome: 'Palha Vieirá', categoriaId: catPalha.id, marcaId: marcaVieira.id, unidade: 'PCT', precoCusto: 77.0, precoTabela: 110.0, estoque: 14, estoqueMinimo: 8 },
  ];
  for (const p of produtos) await prisma.produto.create({ data: p });

  // === CLIENTES ===
  await prisma.cliente.create({
    data: {
      nome: 'Tabacaria da Montanha',
      nomeFantasia: 'Tabacaria da Montanha',
      tipo: 'PESSOA_JURIDICA',
      cpfCnpj: '12.345.678/0001-90',
      email: 'contato@tabacariamontanha.com.br',
      cep: '29290-000',
      endereco: 'Rua Frederico Grulke',
      numero: '1351',
      bairro: 'Centro',
      cidade: 'Santa Maria de Jetibá',
      estado: 'ES',
      contatos: JSON.stringify([
        { nome: 'Mateus', cargo: 'Proprietário', telefone: '(27) 99999-1234', email: 'mateus@tabacariamontanha.com.br' },
      ]),
      limiteCredito: 15000.0,
      condicaoPgto: 'Boleto 30, 45 e 60 dias',
      tags: 'VIP,Atacado,Semanal',
      observacoes: 'Cliente preferencial. Sempre pedir Doce Leite junto.',
    },
  });

  await prisma.cliente.create({
    data: {
      nome: 'Bar do Zé',
      nomeFantasia: 'Bar do Zé',
      tipo: 'PESSOA_FISICA',
      cpfCnpj: '123.456.789-00',
      cidade: 'Ubá',
      estado: 'MG',
      contatos: JSON.stringify([{ nome: 'Zé', cargo: 'Proprietário', telefone: '(32) 3232-1234', email: '' }]),
      condicaoPgto: 'Boleto 30 dias',
      limiteCredito: 3000.0,
      tags: 'Atacado,Quinzenal',
    },
  });

  await prisma.cliente.create({
    data: {
      nome: 'Tabacaria do Centro',
      nomeFantasia: 'Tabacaria do Centro',
      cidade: 'Ubá',
      estado: 'MG',
      condicaoPgto: 'À vista',
      tags: 'Varejo',
    },
  });

  await prisma.cliente.create({
    data: {
      nome: 'Mercearia São José',
      nomeFantasia: 'Mercearia São José LTDA',
      cpfCnpj: '98.765.432/0001-10',
      cidade: 'Viçosa',
      estado: 'MG',
      condicaoPgto: 'Boleto 15 dias',
      limiteCredito: 5000.0,
      tags: 'Atacado',
    },
  });

  await prisma.cliente.create({
    data: {
      nome: 'Casa do Cigarro',
      nomeFantasia: 'Casa do Cigarro',
      cidade: 'Muriaé',
      estado: 'MG',
      condicaoPgto: 'Boleto 30 dias',
    },
  });

  // === USUÁRIOS ===
  const senhaAdmin = await bcrypt.hash('admin123', 10);
  const senhaVend = await bcrypt.hash('vendedor123', 10);
  const senhaCD = await bcrypt.hash('cd123', 10);
  await prisma.usuario.create({ data: { nome: 'Aurélio (Administrador)', email: 'aurelio@alm.com', senhaHash: senhaVend, perfil: 'ADMIN' } });
  await prisma.usuario.create({ data: { nome: 'CD Ubá', email: 'cd@alm.com', senhaHash: senhaCD, perfil: 'CD' } });

  // === PEDIDO exemplo ===
  const aurelio = await prisma.usuario.findFirst({ where: { perfil: 'ADMIN' } });
  const montanha = await prisma.cliente.findFirst({ where: { nome: { contains: 'Montanha' } } });
  const ice = await prisma.produto.findFirst({ where: { nome: { contains: 'Brigadu Ice' } } });
  const mela = await prisma.produto.findFirst({ where: { nome: { contains: 'Brigadu Melancia' } } });
  const sabiá = await prisma.produto.findFirst({ where: { nome: { contains: 'Sabiá' } } });

  const pedido = await prisma.pedido.create({
    data: {
      numero: 21,
      clienteId: montanha.id,
      vendedorId: aurelio.id,
      status: 'ENVIADO',
      condicaoPgto: 'Boleto 30, 45 e 60 dias',
      observacoes: 'Mandar 01 Doce Leite',
      total: 7793.50,
      itens: {
        create: [
          { produtoId: ice.id, quantidade: 4, precoUnit: 165.0, precoCusto: 132.0, total: 660.0 },
          { produtoId: mela.id, quantidade: 4, precoUnit: 180.0, precoCusto: 144.0, total: 720.0 },
          { produtoId: sabiá.id, quantidade: 6, precoUnit: 100.0, precoCusto: 70.0, total: 600.0 },
        ],
      },
    },
  });
  await prisma.historicoPedido.create({ data: { pedidoId: pedido.id, status: 'ENVIADO', usuario: 'Aurélio (Vendedor)' } });

  const ice2 = await prisma.produto.findFirst({ where: { nome: { contains: '3 Lobos' } } });
  const ze = await prisma.cliente.findFirst({ where: { nome: { contains: 'Zé' } } });
  await prisma.pedido.create({
    data: {
      numero: 22,
      clienteId: ze.id,
      vendedorId: aurelio.id,
      status: 'DESPACHADO',
      condicaoPgto: 'Boleto 30 dias',
      total: 1250.0,
      itens: {
        create: [
          { produtoId: ice2.id, quantidade: 5, precoUnit: 130.0, precoCusto: 104.0, total: 650.0 },
          { produtoId: sabiá.id, quantidade: 6, precoUnit: 100.0, precoCusto: 70.0, total: 600.0 },
        ],
      },
    },
  });

  console.log('✅ Banco populado (versão profissional):');
  console.log('   - 5 categorias (com cor)');
  console.log('   - 8 marcas');
  console.log('   - 28 produtos (com custo, estoque, marca)');
  console.log('   - 5 clientes (com CNPJ, contatos, limite, tags)');
  console.log('   - 3 usuários (gerente, vendedor, CD)');
  console.log('   - 2 pedidos de exemplo');
  console.log('');
  console.log('Login:');
  console.log('   Gerente:  matheus@alm.com / admin123');
  console.log('   Vendedor: aurelio@alm.com / vendedor123');
  console.log('   CD:       cd@alm.com / cd123');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

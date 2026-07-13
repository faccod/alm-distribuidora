import { prisma } from '../../../lib/prisma';
import { getSessao } from '../../../lib/auth';
import { redirect } from 'next/navigation';
import { brl } from '../../../lib/format';
import { IconePorNome } from '../../../components/categoria-dialog';
import { PrintButton } from '../../../components/print-button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const ITENS_POR_PAGINA = 12; // 2 colunas × 6 linhas

export default async function CatalogoPage({ searchParams }: { searchParams: { cat?: string; q?: string } }) {
  const sessao = getSessao();
  if (!sessao) redirect('/login');

  const cat = searchParams.cat ? parseInt(searchParams.cat) : null;
  const q = searchParams.q || '';

  const [produtos, categorias, empresa] = await Promise.all([
    prisma.produto.findMany({
      where: {
        ativo: true,
        ...(cat ? { categoriaId: cat } : {}),
        ...(q ? { nome: { contains: q } } : {}),
      },
      orderBy: [{ destaque: 'desc' }, { nome: 'asc' }],
      include: { categoria: true, marca: true },
    }),
    prisma.categoria.findMany({ orderBy: { nome: 'asc' } }),
    prisma.usuario.findFirst({ where: { perfil: 'GERENTE' } }),
  ]);

  // Paginação
  const paginas: typeof produtos[] = [];
  for (let i = 0; i < produtos.length; i += ITENS_POR_PAGINA) {
    paginas.push(produtos.slice(i, i + ITENS_POR_PAGINA));
  }

  return (
    <>
      <style>{`
        html, body { background: white !important; color: #000 !important; }
        * { color-scheme: light !important; }
        .dark, .dark * { color: #000 !important; background: white !important; }

        @page { size: A4; margin: 8mm; }
        @media print {
          .no-print { display: none !important; }
          .pagina { page-break-after: always; padding: 0; }
          .pagina:last-child { page-break-after: auto; }
          .grid-produtos { gap: 0 !important; }
        }
        @media screen {
          .pagina { max-width: 210mm; margin: 0 auto 20px; padding: 8mm; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        }
      `}</style>

      <div className="bg-slate-100 dark:bg-slate-950 min-h-screen print:bg-white">
        <div className="no-print p-4 max-w-3xl mx-auto flex flex-col sm:flex-row gap-2 sticky top-0 bg-slate-100 dark:bg-slate-950 z-10 border-b border-slate-200 dark:border-slate-800">
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />Voltar
          </Link>
          <PrintButton className="flex-1 sm:flex-none" />
        </div>

        {/* Filtros (tela) */}
        <div className="no-print max-w-3xl mx-auto p-4 space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Catálogo de Produtos</h1>
          <p className="text-sm text-slate-500">
            {produtos.length} produtos • {paginas.length} página{paginas.length > 1 ? 's' : ''} • Pronto pra imprimir ou salvar em PDF
          </p>
          <form className="flex gap-2 flex-wrap">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="🔍 Buscar produto..."
              className="flex-1 min-w-[200px] h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
            />
            <select
              name="cat"
              defaultValue={cat || ''}
              className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 px-4 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
            >
              Filtrar
            </button>
          </form>
        </div>

        {produtos.length === 0 ? (
          <div className="pagina text-center py-12">
            <p className="text-slate-500">Nenhum produto pra exibir.</p>
          </div>
        ) : (
          paginas.map((pagina, idx) => (
            <div key={idx} className="pagina">
              {/* Cabeçalho da página (só na primeira) */}
              {idx === 0 && (
                <div className="border-2 border-black mb-3">
                  <div className="grid grid-cols-12">
                    <div className="col-span-4 p-3 border-r-2 border-black flex items-center justify-center bg-slate-100">
                      <div className="text-center">
                        <div className="text-3xl font-black tracking-tighter">ALM</div>
                        <div className="text-[10px] uppercase tracking-widest">Distribuidora</div>
                      </div>
                    </div>
                    <div className="col-span-5 p-3 border-r-2 border-black text-[11px] space-y-0.5">
                      <div className="font-bold">CATÁLOGO DE PRODUTOS</div>
                      <div>(32) 99976-2176</div>
                      <div>Rua Alberto Rodrigues Baião, 572</div>
                      <div>Ubá — MG</div>
                      <div>almdistribuidora@hotmail.com.br</div>
                    </div>
                    <div className="col-span-3 p-3 text-[11px]">
                      <div className="flex justify-between border-b border-black pb-1 mb-1">
                        <span className="font-bold">Pág.</span>
                        <span>{idx + 1}/{paginas.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold">Data:</span>
                        <span>{new Date().toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cabeçalho de páginas seguintes (só número) */}
              {idx > 0 && (
                <div className="flex items-center justify-between mb-2 text-[10px] text-slate-500 border-b border-slate-200 pb-1">
                  <span className="font-bold">ALM Distribuidora — Catálogo</span>
                  <span>Página {idx + 1}/{paginas.length}</span>
                </div>
              )}

              {/* Grid 2 colunas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 grid-produtos">
                {pagina.map((p) => (
                  <div key={p.id} className="border-2 border-black p-2 flex gap-2 min-h-[110px]">
                    {/* Foto / placeholder */}
                    <div className="w-20 h-20 shrink-0 bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden rounded">
                      {p.foto ? (
                        <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: (p.categoria.cor || '#64748b') + '20' }}
                        >
                          <IconePorNome nome={p.categoria.icone} className="w-7 h-7" cor={p.categoria.cor || '#64748b'} />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-1 text-[9px] text-slate-600">
                        <span>Cód: <span className="font-mono">{p.sku || p.id.toString().padStart(5, '0')}</span></span>
                        {p.codigoBarras && (
                          <span className="font-mono">Barras: {p.codigoBarras}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-[13px] leading-tight mt-0.5 uppercase line-clamp-2">
                        {p.nome}
                      </h3>
                      {p.marca && (
                        <p className="text-[10px] text-slate-500">{p.marca.nome}</p>
                      )}
                      <div className="mt-auto flex items-end justify-between">
                        <div>
                          <p className="text-xl font-black text-green-700 leading-none">
                            R$ {Number(p.precoTabela).toFixed(2).replace('.', ',')}
                          </p>
                          {p.unidade && (
                            <p className="text-[9px] text-slate-500 mt-0.5">UN: {p.unidade}</p>
                          )}
                        </div>
                        {p.destaque && (
                          <span className="text-[9px] bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded font-bold">⭐ DESTAQUE</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {/* Preencher com placeholders se a página não tiver todos */}
                {Array.from({ length: ITENS_POR_PAGINA - pagina.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="border border-dashed border-slate-200 print:border-none min-h-[110px] no-print" />
                ))}
              </div>

              {/* Rodapé da página */}
              <div className="text-center text-[9px] text-slate-500 mt-3 border-t border-slate-200 pt-1">
                ALM Distribuidora · {new Date().toLocaleDateString('pt-BR')} · Página {idx + 1} de {paginas.length}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImportarProdutos({ categorias }: { categorias: { id: number; nome: string }[] }) {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [categoriaPadrao, setCategoriaPadrao] = useState<number | ''>(categorias[0]?.id || '');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: number; erro: number } | null>(null);

  function parseLinha(linha: string) {
    const sep = linha.includes('\t') ? '\t' : ';';
    const cols = linha.split(sep).map((c) => c.trim());
    return {
      nome: cols[0] || '',
      unidade: cols[1] || 'UN',
      precoTabela: parseFloat((cols[2] || '0').replace(',', '.')) || 0,
    };
  }

  async function importar() {
    if (!texto.trim() || !categoriaPadrao) return;
    setProcessando(true);
    setResultado(null);
    try {
      const linhas = texto.split(/\r?\n/).filter((l) => l.trim());
      let iniciarEm = 0;
      if (linhas[0] && linhas[0].toLowerCase().includes('nome')) {
        iniciarEm = 1;
      }

      let ok = 0;
      let erro = 0;

      for (let i = iniciarEm; i < linhas.length; i++) {
        const dados = parseLinha(linhas[i]);
        if (!dados.nome) continue;
        const r = await fetch('/api/produtos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...dados, categoriaId: categoriaPadrao }),
        });
        if (r.ok) ok++;
        else erro++;
      }

      setResultado({ ok, erro });
      if (ok > 0) {
        setTimeout(() => router.push('/produtos'), 2000);
      }
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/produtos" className="text-sm">← Voltar</Link>
          <h1 className="font-bold">Importar Produtos</h1>
          <div />
        </div>
      </header>

      <main className="p-3 max-w-3xl mx-auto space-y-3">
        <section className="card space-y-2">
          <h2 className="font-bold">📋 Formato</h2>
          <p className="text-sm text-slate-600">
            Cole linhas do Excel/CSV. Ordem: <code>nome; unidade; preço</code>
          </p>
          <div>
            <label className="text-xs font-semibold">Categoria padrão pra todos importados</label>
            <select
              className="input mt-1"
              value={categoriaPadrao}
              onChange={(e) => setCategoriaPadrao(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Escolha uma categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="card">
          <label className="text-xs font-semibold">Cole os dados:</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={12}
            className="input mt-1 font-mono text-xs"
            placeholder="Cole aqui..."
          />
          <button
            onClick={importar}
            disabled={processando || !texto.trim() || !categoriaPadrao}
            className="btn btn-primary w-full mt-3"
          >
            {processando ? 'Importando...' : `📥 Importar ${texto.split('\n').filter((l) => l.trim()).length} produto(s)`}
          </button>
        </section>

        {resultado && (
          <section className="card">
            <p className="text-green-600">✅ {resultado.ok} produto(s) importado(s)</p>
            {resultado.erro > 0 && <p className="text-red-600">❌ {resultado.erro} erro(s)</p>}
          </section>
        )}
      </main>
    </div>
  );
}

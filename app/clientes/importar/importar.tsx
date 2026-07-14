'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImportarClientes() {
  const router = useRouter();
  const [texto, setTexto] = useState('');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: number; erro: number; erros: string[] } | null>(null);

  function parseLinha(linha: string) {
    // Aceita separador por TAB (Excel copia) ou ponto-e-vírgula
    const sep = linha.includes('\t') ? '\t' : ';';
    const cols = linha.split(sep).map((c) => c.trim());
    return {
      nome: cols[0] || '',
      apelido: cols[1] || null,
      endereco: cols[2] || null,
      bairro: cols[3] || null,
      cidade: cols[4] || null,
      estado: cols[5] || null,
      cep: cols[6] || null,
      cnpj: cols[7] || null,
      inscricao: cols[8] || null,
      telefone: cols[9] || null,
      contato: cols[10] || null,
      condicaoPgto: cols[11] || null,
    };
  }

  async function importar() {
    if (!texto.trim()) return;
    setProcessando(true);
    setResultado(null);
    try {
      const linhas = texto.split(/\r?\n/).filter((l) => l.trim());
      // Pula cabeçalho se a primeira linha tem "nome" no começo
      let iniciarEm = 0;
      if (linhas[0] && linhas[0].toLowerCase().includes('nome')) {
        iniciarEm = 1;
      }

      let ok = 0;
      let erro = 0;
      const erros: string[] = [];

      for (let i = iniciarEm; i < linhas.length; i++) {
        const dados = parseLinha(linhas[i]);
        if (!dados.nome) continue;
        try {
          const r = await fetch('/api/clientes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados),
          });
          if (r.ok) ok++;
          else {
            erro++;
            erros.push(`Linha ${i + 1}: ${dados.nome}`);
          }
        } catch {
          erro++;
          erros.push(`Linha ${i + 1}: ${dados.nome}`);
        }
      }

      setResultado({ ok, erro, erros });
      if (ok > 0) {
        setTimeout(() => router.push('/clientes'), 2000);
      }
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/clientes" className="text-sm">← Voltar</Link>
          <h1 className="font-bold">Importar Clientes</h1>
          <div />
        </div>
      </header>

      <main className="p-3 max-w-3xl mx-auto space-y-3">
        <section className="card space-y-2">
          <h2 className="font-bold">📋 Formato esperado</h2>
          <p className="text-sm text-slate-600">
            Cole abaixo linhas do Excel (uma por cliente) ou CSV separado por <b>;</b>.
          </p>
          <p className="text-xs text-slate-500">
            Ordem das colunas: <code>nome; apelido; endereço; bairro; cidade; estado; cep; cnpj; inscrição; telefone; contato; condição pgto</code>
          </p>
          <details className="text-xs">
            <summary className="cursor-pointer text-blue-600">Ver exemplo</summary>
            <pre className="bg-slate-100 p-2 mt-1 rounded text-[10px] overflow-x-auto">
{`Tabacaria da Montanha;Montanha;Rua Frederico Grulke, 1351;Centro;Santa Maria de Jetibá;ES;29290-000;;;Mateus;Boleto 30, 45 e 60 dias
Bar do Zé;Zé;Av Brasil, 100;Centro;Ubá;MG;36500-000;12345678000190;123.456;3232-1234;Zé;Boleto 30 dias
Tabacaria do Centro;Centro;Rua das Flores, 50;Centro;Ubá;MG;36500-000;;;;;À vista`}
            </pre>
          </details>
        </section>

        <section className="card">
          <label className="text-xs font-semibold">Cole seus dados aqui:</label>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={12}
            className="input mt-1 font-mono text-xs"
            placeholder="Cole aqui as linhas do Excel/CSV..."
          />
          <button
            onClick={importar}
            disabled={processando || !texto.trim()}
            className="btn btn-primary w-full mt-3"
          >
            {processando ? 'Importando...' : `📥 Importar ${texto.split('\n').filter((l) => l.trim()).length} cliente(s)`}
          </button>
        </section>

        {resultado && (
          <section className="card">
            <h3 className="font-bold mb-2">Resultado</h3>
            <p className="text-green-600">✅ {resultado.ok} cliente(s) importado(s)</p>
            {resultado.erro > 0 && (
              <>
                <p className="text-red-600">❌ {resultado.erro} erro(s):</p>
                <ul className="text-xs text-slate-600 mt-1">
                  {resultado.erros.slice(0, 10).map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

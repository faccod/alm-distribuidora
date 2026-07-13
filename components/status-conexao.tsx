'use client';
import { useOnline } from '../lib/use-online';

export default function StatusConexao() {
  const { online, pendentes, sincronizando, sincronizar } = useOnline();

  if (online && pendentes === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 text-center text-xs py-1 ${
        online ? 'bg-blue-600' : 'bg-amber-500'
      } text-white`}
    >
      {online ? (
        <>
          {sincronizando
            ? '🔄 Sincronizando pedidos pendentes...'
            : `📡 ${pendentes} pedido(s) pendente(s) para sincronizar`}
          {!sincronizando && pendentes > 0 && (
            <button
              onClick={sincronizar}
              className="ml-2 underline font-bold"
            >
              Sincronizar agora
            </button>
          )}
        </>
      ) : (
        <>📴 Modo offline — seus pedidos serão salvos e enviados quando voltar o sinal</>
      )}
    </div>
  );
}

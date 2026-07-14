// Fila de pedidos offline (IndexedDB)
// Quando o vendedor cria pedido sem internet, salva aqui.
// Quando volta a conexão, sincroniza com o servidor.

const DB_NAME = 'alm-offline';
const STORE = 'pedidos-pendentes';
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export type PedidoPendente = {
  id: string; // uuid local
  clienteId: string;
  clienteNome: string;
  vendedorId: string;
  condicaoPgto: string | null;
  observacoes: string | null;
  itens: Array<{
    produtoId: number;
    produtoNome: string;
    quantidade: number;
    precoUnit: number;
    observacao: string | null;
  }>;
  total: number;
  criadoEm: string;
  status: 'RASCUNHO' | 'ENVIADO';
};

export async function salvarPedidoOffline(p: PedidoPendente) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(p);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function listarPedidosPendentes(): Promise<PedidoPendente[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result as PedidoPendente[]);
    req.onerror = () => reject(req.error);
  });
}

export async function removerPedidoOffline(id: string) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function contarPendentes(): Promise<number> {
  const lista = await listarPedidosPendentes();
  return lista.length;
}

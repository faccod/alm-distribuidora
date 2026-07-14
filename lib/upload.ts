// Helper pra fazer upload de arquivo
// Usa JSON+base64 (workaround pra bug do Next.js Vercel serverless com multipart+cookie)
export async function uploadFile(file: File): Promise<{ url: string }> {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  // Converte pra base64 de forma segura (suporta arquivos grandes)
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64 = btoa(binary);

  const r = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file: base64, ext }),
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: r.statusText }));
    throw new Error(err.error || 'Erro no upload');
  }
  return r.json();
}

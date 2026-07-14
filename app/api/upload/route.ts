import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { buscarSessao } from '../../../lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Aceita multipart/form-data E JSON+base64 (JSON usado em prod Vercel pra
// contornar bug do Next.js serverless com formData+cookie)
export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let bytes: Buffer;
    let ext: string;
    let filename: string;

    if (contentType.startsWith('application/json')) {
      // Recebe JSON com arquivo em base64
      const body = await req.json();
      if (!body.file || !body.ext) {
        return NextResponse.json({ error: 'JSON deve ter { file: base64, ext: "png" }' }, { status: 400 });
      }
      const extInput = String(body.ext).toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extInput)) {
        return NextResponse.json({ error: 'Formato não permitido' }, { status: 400 });
      }
      bytes = Buffer.from(body.file, 'base64');
      ext = extInput;
      filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    } else {
      // multipart/form-data (funciona em dev/local)
      const fd = await req.formData();
      const file = fd.get('file') as File | null;
      if (!file) return NextResponse.json({ error: 'Sem arquivo' }, { status: 400 });
      bytes = Buffer.from(await file.arrayBuffer());
      const extInput = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extInput)) {
        return NextResponse.json({ error: 'Formato não permitido' }, { status: 400 });
      }
      ext = extInput;
      filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    }

    if (bytes.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
    }

    const sessao = await buscarSessao();
    if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
      const blob = await put(filename, bytes, {
        access: 'public',
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url });
    } else {
      const dir = path.join(process.cwd(), 'public', 'uploads');
      if (!existsSync(dir)) await mkdir(dir, { recursive: true });
      const localName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await writeFile(path.join(dir, localName), bytes);
      return NextResponse.json({ url: `/uploads/${localName}` });
    }
  } catch (err: any) {
    console.error('[/api/upload] ERRO:', err?.message, err?.stack);
    return NextResponse.json({ error: 'Erro no upload: ' + (err?.message || 'desconhecido') }, { status: 500 });
  }
}

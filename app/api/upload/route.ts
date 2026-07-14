import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { buscarSessao } from '../../../lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

// Usa Vercel Blob em produção (BLOB_READ_WRITE_TOKEN setado) e filesystem local em dev
export async function POST(req: Request) {
  try {
    const sessao = await buscarSessao();
    if (!sessao) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const fd = await req.formData();
    const file = fd.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'Sem arquivo' }, { status: 400 });

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      return NextResponse.json({ error: 'Formato não permitido' }, { status: 400 });
    }
    if (bytes.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
    }

    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
      // Produção: Vercel Blob (usa OIDC token auto-injetado pela Vercel quando BLOB_STORE_ID ta setado)
      const blob = await put(filename, bytes, {
        access: 'public',
        addRandomSuffix: false,
      });
      return NextResponse.json({ url: blob.url });
    } else {
      // Dev: grava no filesystem local
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
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const c = cookies().get('alm_session');
    const info: any = {
      hasCookie: !!c,
      cookieValue: c?.value?.substring(0, 10) + '...',
      cookieLength: c?.value?.length,
    };
    if (c?.value) {
      try {
        const sessao = await prisma.sessao.findUnique({
          where: { token: c.value },
          include: { usuario: true },
        });
        info.found = !!sessao;
        info.userEmail = sessao?.usuario?.email;
      } catch (e: any) {
        info.lookupError = e.message;
      }
    }
    return NextResponse.json(info);
  } catch (e: any) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const c = cookies().get('alm_session');
    const info: any = {
      hasCookie: !!c,
      cookieValue: c?.value?.substring(0, 10) + '...',
    };
    // Tentar formData AQUI (depois do cookie check)
    const fd = await req.formData();
    info.formDataOk = true;
    const file = fd.get('file') as File | null;
    info.fileName = file?.name;
    info.fileSize = file?.size;
    return NextResponse.json(info);
  } catch (e: any) {
    return NextResponse.json({
      error: e.message,
      formDataError: e.cause,
    }, { status: 500 });
  }
}

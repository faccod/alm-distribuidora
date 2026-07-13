import { NextResponse } from 'next/server';
import { login } from '../../../lib/auth';

export async function POST(req: Request) {
  const { email, senha } = await req.json();
  if (!email || !senha) {
    return NextResponse.json({ error: 'Informe e-mail e senha' }, { status: 400 });
  }
  const sessao = await login(email, senha);
  if (!sessao) {
    return NextResponse.json({ error: 'E-mail ou senha inválidos' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, sessao });
}

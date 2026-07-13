import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

const COOKIE_NAME = 'alm_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export type Sessao = {
  id: string;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'CD';
};

export async function login(email: string, senha: string): Promise<Sessao | null> {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.ativo) return null;
  const ok = await bcrypt.compare(senha, usuario.senhaHash);
  if (!ok) return null;

  const sessao: Sessao = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil as Sessao['perfil'],
  };

  cookies().set(COOKIE_NAME, JSON.stringify(sessao), {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return sessao;
}

export function logout() {
  cookies().delete(COOKIE_NAME);
}

export function getSessao(): Sessao | null {
  const c = cookies().get(COOKIE_NAME);
  if (!c) return null;
  try {
    return JSON.parse(c.value) as Sessao;
  } catch {
    return null;
  }
}

export function requireSessao(): Sessao {
  const s = getSessao();
  if (!s) throw new Error('UNAUTHENTICATED');
  return s;
}

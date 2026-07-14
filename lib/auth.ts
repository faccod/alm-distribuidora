import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const COOKIE_NAME = 'alm_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export type Sessao = {
  id: string;
  nome: string;
  email: string;
  perfil: 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'CD';
};

// Gera token opaco aleatorio (32 bytes hex = 64 chars, sem caracteres especiais)
function gerarToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

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

  // Cria registro de sessao no banco (token opaco, sem caracteres problematicos)
  const token = gerarToken();
  const expiraEm = new Date(Date.now() + COOKIE_MAX_AGE * 1000);
  await prisma.sessao.create({
    data: {
      token,
      usuarioId: usuario.id,
      expiraEm,
    },
  });

  // Limpa sessoes expiradas do mesmo usuario (housekeeping)
  await prisma.sessao.deleteMany({
    where: {
      usuarioId: usuario.id,
      expiraEm: { lt: new Date() },
    },
  });

  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });

  return sessao;
}

export async function logout() {
  const c = cookies().get(COOKIE_NAME);
  if (c?.value) {
    await prisma.sessao.delete({ where: { token: c.value } }).catch(() => {});
  }
  cookies().delete(COOKIE_NAME);
}

export async function buscarSessao(): Promise<Sessao | null> {
  const c = cookies().get(COOKIE_NAME);
  if (!c?.value) return null;
  try {
    const sessao = await prisma.sessao.findUnique({
      where: { token: c.value },
      include: { usuario: true },
    });
    if (!sessao) return null;
    if (sessao.expiraEm < new Date()) {
      // Expirou: limpa
      await prisma.sessao.delete({ where: { token: c.value } }).catch(() => {});
      return null;
    }
    return {
      id: sessao.usuario.id,
      nome: sessao.usuario.nome,
      email: sessao.usuario.email,
      perfil: sessao.usuario.perfil as Sessao['perfil'],
    };
  } catch {
    return null;
  }
}

export async function requireSessao(): Promise<Sessao> {
  const s = await buscarSessao();
  if (!s) throw new Error('UNAUTHENTICATED');
  return s;
}

'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '../../components/theme-toggle';

export default function Login() {
  const [email, setEmail] = useState('aurelio@alm.com');
  const [senha, setSenha] = useState('vendedor123');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });
      if (!r.ok) {
        const d = await r.json();
        toast.error('Falha no login', { description: d.error || 'Verifique suas credenciais' });
        return;
      }
      toast.success('Bem-vindo de volta!');
      router.push('/');
      router.refresh();
    } catch (e) {
      toast.error('Erro de conexão');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900 text-2xl font-black shadow-xl mb-4">
            ALM
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Distribuidora</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sistema de gestão de pedidos</p>
        </div>

        <Card className="shadow-xl border-slate-200/60 dark:border-slate-800 animate-slide-up">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">E-mail</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Senha</label>
                <div className="relative">
                  <Input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={carregando} className="w-full" size="lg">
                <LogIn className="w-4 h-4" />
                {carregando ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur text-xs text-slate-600 dark:text-slate-400">
          <p className="font-semibold mb-2 text-slate-700 dark:text-slate-300">🔑 Acesso de demonstração</p>
          <div className="space-y-1 font-mono">
            <p><span className="text-slate-500">Gerente:</span> matheus@alm.com / admin123</p>
            <p><span className="text-slate-500">Vendedor:</span> aurelio@alm.com / vendedor123</p>
            <p><span className="text-slate-500">CD:</span> cd@alm.com / cd123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

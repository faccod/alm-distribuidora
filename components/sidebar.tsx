'use client';
import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Truck,
  TrendingUp,
  UserCog,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Sun,
  Moon,
  BookOpen,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useTheme } from './theme-provider';

type Sessao = { id: string; nome: string; email: string; perfil: 'ADMIN' | 'GERENTE' | 'VENDEDOR' | 'CD' };

const allLinks = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, perfil: ['ADMIN', 'GERENTE', 'VENDEDOR', 'CD'] },
  { href: '/pedidos/novo', label: 'Novo Pedido', icon: PlusCircle, perfil: ['ADMIN', 'GERENTE', 'VENDEDOR'], accent: true },
  { href: '/pedidos', label: 'Pedidos', icon: ShoppingCart, perfil: ['ADMIN', 'GERENTE', 'VENDEDOR', 'CD'] },
  { href: '/clientes', label: 'Clientes', icon: Users, perfil: ['ADMIN', 'GERENTE', 'VENDEDOR'] },
  { href: '/produtos', label: 'Produtos', icon: Package, perfil: ['ADMIN', 'GERENTE', 'VENDEDOR'] },
  { href: '/produtos/catalog', label: 'Catálogo', icon: BookOpen, perfil: ['ADMIN', 'GERENTE', 'VENDEDOR'] },
  { href: '/cd', label: 'Painel CD', icon: Truck, perfil: ['ADMIN', 'GERENTE', 'CD'] },
  { href: '/relatorios', label: 'Relatórios', icon: TrendingUp, perfil: ['ADMIN', 'GERENTE'] },
  { href: '/usuarios', label: 'Usuários', icon: UserCog, perfil: ['ADMIN', 'GERENTE'] },
];

export function Sidebar({ sessao }: { sessao: Sessao }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const links = allLinks.filter((l) => l.perfil.includes(sessao.perfil));

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur h-14 flex items-center justify-between px-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center text-white dark:text-slate-900 font-black text-sm">
            A
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">ALM</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 z-50 lg:z-10 print:hidden',
          'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
          'flex flex-col transition-transform duration-200',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 flex items-center justify-center text-white dark:text-slate-900 font-black text-sm">
              A
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-slate-100 leading-none">ALM</p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5">Distribuidora</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User */}
        <div className="px-3 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {sessao.nome.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
                {sessao.nome}
              </p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                {sessao.perfil}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : link.accent
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {resolvedTheme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}

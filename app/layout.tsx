import './globals.css';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { ThemeProvider } from '../components/theme-provider';
import { Toaster } from '../components/ui/sonner';
import StatusConexao from '../components/status-conexao';
import { Sidebar } from '../components/sidebar';

export const metadata: Metadata = {
  title: 'ALM Distribuidora',
  description: 'Sistema de pedidos da ALM Distribuidora',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'ALM' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
};

function getSessaoFromCookie() {
  const c = cookies().get('alm_session');
  if (!c) return null;
  try {
    return JSON.parse(c.value);
  } catch {
    return null;
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sessao = getSessaoFromCookie();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <ThemeProvider>
          <StatusConexao />
          {sessao ? (
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
              <Sidebar sessao={sessao} />
              <main className="flex-1 min-w-0 lg:pt-0 pt-14">{children}</main>
            </div>
          ) : (
            children
          )}
          <Toaster />
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

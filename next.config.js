/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PWA: permitir instalação no celular
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Forçar charset utf-8 em todos os responses de API (corrige mojibake em JSON)
        source: '/api/:path*',
        headers: [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
      },
    ];
  },
};

module.exports = nextConfig;

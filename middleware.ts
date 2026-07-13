// Forca charset utf-8 em todas as respostas de API
// (necessario porque NextResponse.json() nao seta charset no Vercel serverless)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.startsWith('application/json') && !contentType.includes('charset')) {
    response.headers.set('content-type', 'application/json; charset=utf-8');
  }
  return response;
}

export const config = {
  matcher: '/api/:path*',
};

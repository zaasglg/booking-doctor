import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // Публичные роуты, которые не требуют авторизации
  const publicRoutes = ['/api/auth/login', '/api/auth/register', '/'];
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Если это публичный роут, пропускаем
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Для защищенных роутов (API и UI) проверяем токен
  const isProtectedPath =
    (request.nextUrl.pathname.startsWith('/api/') && !request.nextUrl.pathname.startsWith('/api/auth/')) ||
    request.nextUrl.pathname.startsWith('/profile') ||
    request.nextUrl.pathname.startsWith('/admin');

  if (isProtectedPath && !token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    // Если это UI роут, редиректим на главную (или страницу логина)
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};


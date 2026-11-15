import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './app/i18n/settings';

function getLocale(request: NextRequest) {
  // Check if locale is in cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Check if locale is in accept-language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const acceptedLocales = acceptLanguage.split(',').map(locale => locale.split(';')[0].trim());
    const matchedLocale = acceptedLocales.find(locale => 
      locales.includes(locale as any) || locales.find(l => locale.startsWith(l))
    );
    if (matchedLocale) {
      return matchedLocale.substring(0, 2);
    }
  }

  // Default locale
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if pathname has a locale
  const pathnameHasLocale = locales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  
  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, etc)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

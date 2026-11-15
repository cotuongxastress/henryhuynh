import { ReactNode } from 'react';
import { Locale, locales } from '../../app/i18n/settings';
import { getDictionary } from '@/app/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <>
      <header className="p-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">{dictionary.common.appName}</h1>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
      <footer className="p-4 border-t mt-8">
        <div className="container mx-auto text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} {dictionary.common.appName}
        </div>
      </footer>
    </>
  );
}

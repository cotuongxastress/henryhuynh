'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { locales, localeNames, Locale } from '../app/i18n/settings';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Extract current locale from pathname
  const currentLocale = pathname.split('/')[1] as Locale;
  
  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;
    
    // Replace current locale in pathname with new locale
    const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    
    // Set cookie for future requests
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 year
    
    // Navigate to new locale path
    router.push(newPathname);
  };

  return (
    <div className="language-switcher">
      <select 
        value={currentLocale}
        onChange={(e) => handleLanguageChange(e.target.value as Locale)}
        className="select select-bordered select-sm"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {localeNames[locale]}
          </option>
        ))}
      </select>
    </div>
  );
}

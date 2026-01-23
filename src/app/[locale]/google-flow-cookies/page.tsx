import { getDictionary } from '@/app/i18n';
import { Locale } from '@/app/i18n/settings';
import GoogleFlowCookieForm from '@/components/GoogleFlowCookieForm';

export const metadata = {
  title: 'Google Flow Cookie Extractor',
  description: 'Extract cookies from Google Flow for video creation',
};

export default async function GoogleFlowCookiesPage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <GoogleFlowCookieForm dictionary={dictionary} locale={locale} />
    </div>
  );
}

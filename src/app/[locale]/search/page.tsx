import { getDictionary } from '@/app/i18n';
import { Locale } from '../../../app/i18n/settings';
import SearchResults from '@/components/SearchResults';

export default async function SearchPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const dictionary = await getDictionary(locale);
  const query = q || '';

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{dictionary.search.title}: {query}</h1>
      
      <SearchResults 
        dictionary={dictionary} 
        locale={locale} 
      />
    </div>
  );
}

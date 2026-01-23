import { getDictionary } from '@/app/i18n';
import { Locale } from '../../app/i18n/settings';
import SearchForm from '@/components/SearchForm';
import Link from 'next/link';

export default async function HomePage({
  params: { locale }
}: {
  params: { locale: Locale };
}) {
  const dictionary = await getDictionary(locale);

  return (
    <div className="flex flex-col gap-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">{dictionary.home.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {dictionary.home.subtitle}
        </p>
      </section>

      <section className="max-w-2xl mx-auto w-full">
        <div className="flex flex-col gap-4">
          <SearchForm dictionary={dictionary} locale={locale} />
          
          <div className="text-center">
            <span className="text-gray-500">{dictionary.home.orText}</span>
          </div>
          
          <Link href={`/${locale}/suggest`}>
            <button className="bg-green-500 text-white p-4 rounded-lg font-medium w-full">
              {dictionary.home.suggestButton}
            </button>
          </Link>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{dictionary.home.trendingTopics}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Placeholder for trending topics */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 hover:shadow-md transition">
              <h3 className="font-bold">Trending Topic {i}</h3>
              <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

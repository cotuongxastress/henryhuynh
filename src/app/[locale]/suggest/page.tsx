import { getDictionary } from '@/app/i18n';
import { Locale } from '../../../app/i18n/settings';
import SuggestionForm from '@/components/SuggestionForm';

export default async function SuggestPage({
  params
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{dictionary.suggest.title}</h1>
      <p className="text-gray-600 mb-8">
        {dictionary.home.subtitle}
      </p>
      
      <SuggestionForm 
        dictionary={dictionary} 
        locale={locale} 
      />
    </div>
  );
}

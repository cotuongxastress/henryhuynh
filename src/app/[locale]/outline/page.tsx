import { getDictionary } from '@/app/i18n';
import { Locale } from '../../../app/i18n/settings';
import OutlineForm from '@/components/OutlineForm';

export default async function OutlinePage({
  params,
  searchParams
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ topic?: string }>;
}) {
  const { locale } = await params;
  const { topic } = await searchParams;
  const dictionary = await getDictionary(locale);
  const initialTopic = topic || '';

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{dictionary.outline.title}</h1>
      <p className="text-gray-600 mb-8">
        {dictionary.home.subtitle}
      </p>
      
      <OutlineForm 
        dictionary={dictionary} 
        locale={locale}
        initialTopic={initialTopic}
      />
    </div>
  );
}

'use client';

import { useState, FormEvent } from 'react';
import { Locale } from '../app/i18n/settings';

interface OutlineFormProps {
  dictionary: any;
  locale: Locale;
  initialTopic?: string;
}

interface OutlineSection {
  title: string;
  points: string[];
}

interface Outline {
  title: string;
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
}

export default function OutlineForm({ dictionary, locale, initialTopic = '' }: OutlineFormProps) {
  const [topic, setTopic] = useState(initialTopic);
  const [duration, setDuration] = useState('medium');
  const [language, setLanguage] = useState(locale);
  const [isLoading, setIsLoading] = useState(false);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!topic) {
      setError('Please enter a topic');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/outline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic,
          duration,
          language,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate outline');
      }
      
      const data = await response.json();
      setOutline(data.outline);
    } catch (err) {
      console.error('Error generating outline:', err);
      setError('Failed to generate outline');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!outline) return;
    
    let outlineText = `# ${outline.title}\n\n`;
    outlineText += `## ${dictionary.outline.introduction}\n${outline.introduction}\n\n`;
    
    outlineText += `## ${dictionary.outline.mainContent}\n`;
    outline.sections.forEach((section, index) => {
      outlineText += `### ${section.title}\n`;
      section.points.forEach((point) => {
        outlineText += `- ${point}\n`;
      });
      outlineText += '\n';
    });
    
    outlineText += `## ${dictionary.outline.conclusion}\n${outline.conclusion}`;
    
    navigator.clipboard.writeText(outlineText)
      .then(() => {
        alert('Outline copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
      });
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {dictionary.outline.topicLabel}
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
            placeholder="Enter video topic"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            {dictionary.outline.durationLabel}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="duration"
                value="short"
                checked={duration === 'short'}
                onChange={() => setDuration('short')}
                disabled={isLoading}
                className="mr-2"
              />
              {dictionary.outline.shortOption}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="duration"
                value="medium"
                checked={duration === 'medium'}
                onChange={() => setDuration('medium')}
                disabled={isLoading}
                className="mr-2"
              />
              {dictionary.outline.mediumOption}
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="duration"
                value="long"
                checked={duration === 'long'}
                onChange={() => setDuration('long')}
                disabled={isLoading}
                className="mr-2"
              />
              {dictionary.outline.longOption}
            </label>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            {dictionary.outline.languageLabel}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Locale)}
            className="w-full p-2 border rounded"
            disabled={isLoading}
          >
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
            <option value="es">Español</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 text-white p-3 rounded-lg font-medium hover:bg-green-600 transition"
        >
          {isLoading ? '...' : dictionary.outline.generateButton}
        </button>
      </form>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {outline && (
        <div className="space-y-6 border rounded-lg p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{outline.title}</h2>
            <div className="space-x-2">
              <button
                onClick={copyToClipboard}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
              >
                {dictionary.outline.copyButton}
              </button>
              <button
                onClick={() => handleSubmit({ preventDefault: () => {} } as FormEvent)}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300 transition"
              >
                {dictionary.outline.regenerateButton}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg border-b pb-1 mb-2">{dictionary.outline.introduction}</h3>
              <p className="text-gray-700">{outline.introduction}</p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg border-b pb-1 mb-2">{dictionary.outline.mainContent}</h3>
              <div className="space-y-3">
                {outline.sections.map((section, index) => (
                  <div key={index} className="pl-4 border-l-2 border-gray-200">
                    <h4 className="font-bold">{section.title}</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {section.points.map((point, pointIndex) => (
                        <li key={pointIndex} className="text-gray-700">{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg border-b pb-1 mb-2">{dictionary.outline.conclusion}</h3>
              <p className="text-gray-700">{outline.conclusion}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

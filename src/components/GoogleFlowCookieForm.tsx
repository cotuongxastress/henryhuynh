'use client';

import { useState, FormEvent } from 'react';
import {
  parseCookies,
  detectFormat,
  filterGoogle,
  checkGoogleAuth,
  toHeaderString,
  toJson,
  toNetscape,
  type NormalizedCookie,
  type CookieFormat,
  type AuthCheck,
} from '@/lib/cookies';

interface GoogleFlowCookieFormProps {
  dictionary: any;
  locale: string;
}

interface ParseResult {
  cookies: NormalizedCookie[];
  googleCookies: NormalizedCookie[];
  auth: AuthCheck;
  detectedFormat: string;
}

export default function GoogleFlowCookieForm({ dictionary, locale }: GoogleFlowCookieFormProps) {
  const [raw, setRaw] = useState('');
  const [format, setFormat] = useState<CookieFormat>('auto');
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!raw.trim()) {
      setError('Please paste your exported cookies first.');
      return;
    }

    try {
      const cookies = parseCookies(raw, format);
      if (cookies.length === 0) {
        setError('No cookies could be read. Check the format or try a different one.');
        return;
      }
      const googleCookies = filterGoogle(cookies);
      setResult({
        cookies,
        googleCookies,
        auth: checkGoogleAuth(cookies),
        detectedFormat: format === 'auto' ? detectFormat(raw) : format,
      });
    } catch (err) {
      setError(
        'Could not parse the input' +
          (err instanceof Error ? `: ${err.message}` : '. Please check the format.')
      );
    }
  };

  const exportCookies = () => (result && result.googleCookies.length ? result.googleCookies : result?.cookies ?? []);

  const copyHeader = async () => {
    try {
      await navigator.clipboard.writeText(toHeaderString(exportCookies()));
      alert('Cookie header string copied to clipboard!');
    } catch {
      alert('Clipboard not available in this context.');
    }
  };

  const download = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Form Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Google Flow Cookie Tool</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Paste cookies you exported from a browser already signed in to{' '}
          <span className="font-mono text-sm">labs.google/fx/vi/tools/flow</span>. Everything is
          processed in your browser — nothing is sent to any server, and no password is required.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cookies" className="block text-sm font-medium mb-2">
              Exported cookies
            </label>
            <textarea
              id="cookies"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={
                'Paste here. Supported formats:\n' +
                '• JSON array (Cookie-Editor / EditThisCookie export)\n' +
                '• Netscape cookies.txt (Get cookies.txt / yt-dlp)\n' +
                '• Header string:  SID=...; HSID=...; SAPISID=...'
              }
              rows={10}
              className="w-full p-3 border rounded-lg font-mono text-xs dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label htmlFor="format" className="block text-sm font-medium mb-2">
                Input format
              </label>
              <select
                id="format"
                value={format}
                onChange={(e) => setFormat(e.target.value as CookieFormat)}
                className="p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="auto">Auto-detect</option>
                <option value="json">JSON</option>
                <option value="netscape">Netscape (cookies.txt)</option>
                <option value="header">Header string</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Parse Cookies
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Results</h3>

          {/* Auth status */}
          <div
            className={
              'rounded-lg p-4 border ' +
              (result.auth.hasAuth
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800')
            }
          >
            <h4 className="font-semibold mb-2">
              {result.auth.hasAuth
                ? '✅ Signed-in Google session detected'
                : '⚠️ No Google login cookie found'}
            </h4>
            <p className="text-sm">
              Detected format: <strong>{result.detectedFormat}</strong> · Total cookies:{' '}
              <strong>{result.cookies.length}</strong> · Google cookies:{' '}
              <strong>{result.googleCookies.length}</strong>
            </p>
            {result.auth.found.length > 0 && (
              <p className="text-sm mt-1">
                Auth cookies found: <span className="font-mono">{result.auth.found.join(', ')}</span>
              </p>
            )}
            {!result.auth.hasAuth && (
              <p className="text-sm mt-1 text-yellow-800 dark:text-yellow-300">
                Missing a SID-family cookie (e.g. <span className="font-mono">SID</span>,{' '}
                <span className="font-mono">__Secure-1PSID</span>). Re-export while signed in to
                Google and make sure you include all google.com cookies.
              </p>
            )}
          </div>

          {/* Export buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={copyHeader}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
            >
              Copy header string
            </button>
            <button
              onClick={() => download(toJson(result.cookies), `flow-cookies-${Date.now()}.json`, 'application/json')}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
            >
              Download JSON
            </button>
            <button
              onClick={() => download(toNetscape(result.cookies), `flow-cookies-${Date.now()}.txt`, 'text/plain')}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              Download cookies.txt
            </button>
          </div>

          {/* Cookie table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b dark:border-gray-700">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Domain</th>
                  <th className="py-2 pr-4">Secure</th>
                  <th className="py-2">Value</th>
                </tr>
              </thead>
              <tbody>
                {result.cookies.map((c, i) => (
                  <tr key={`${c.name}-${i}`} className="border-b dark:border-gray-700/50 align-top">
                    <td className="py-1 pr-4 font-mono whitespace-nowrap">{c.name}</td>
                    <td className="py-1 pr-4 font-mono whitespace-nowrap">{c.domain || '—'}</td>
                    <td className="py-1 pr-4">{c.secure ? 'yes' : 'no'}</td>
                    <td className="py-1 font-mono break-all text-gray-500 dark:text-gray-400">
                      {c.value.length > 24 ? `${c.value.slice(0, 24)}…` : c.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* How-to Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">How to export your cookies</h4>
        <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
          <li>Sign in to <span className="font-mono">labs.google/fx/vi/tools/flow</span> in your normal browser.</li>
          <li>Install a cookie-export extension, e.g. “Cookie-Editor” or “Get cookies.txt LOCALLY”.</li>
          <li>On the Flow tab, open the extension and Export (JSON or cookies.txt) for google.com.</li>
          <li>Paste the exported content above and press “Parse Cookies”.</li>
        </ol>
      </div>

      {/* Security note */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Handle with care</h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
          <li>These cookies grant access to your Google account — treat them like a password.</li>
          <li>Parsing happens locally in your browser; nothing is uploaded.</li>
          <li>Never paste cookies into a site or tool you do not trust.</li>
          <li>Sign out / clear the session to invalidate exported cookies when you are done.</li>
        </ul>
      </div>
    </div>
  );
}

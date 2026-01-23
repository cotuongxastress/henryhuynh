'use client';

import { useState, FormEvent } from 'react';

interface GoogleFlowCookieFormProps {
  dictionary: any;
  locale: string;
}

interface CookieResult {
  success: boolean;
  cookies?: any[];
  allCookies?: any[];
  pageInfo?: {
    url: string;
    title: string;
    ready: string;
  };
  timestamp?: string;
  error?: string;
  details?: string;
}

export default function GoogleFlowCookieForm({ dictionary, locale }: GoogleFlowCookieFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('https://labs.google/fx/vi/tools/flow');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CookieResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setResult({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/google-flow-cookies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, url }),
      });

      const data = await response.json();
      setResult(data);

    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to connect to server',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyCookiesToClipboard = () => {
    if (result?.cookies) {
      const cookieString = result.cookies
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
      navigator.clipboard.writeText(cookieString);
      alert('Cookies copied to clipboard!');
    }
  };

  const downloadCookiesAsJSON = () => {
    if (result?.cookies) {
      const dataStr = JSON.stringify(result.cookies, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `google-flow-cookies-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const downloadCookiesAsNetscape = () => {
    if (result?.cookies) {
      let netscapeFormat = '# Netscape HTTP Cookie File\n';
      result.cookies.forEach(cookie => {
        netscapeFormat += `${cookie.domain}\t${cookie.httpOnly ? 'TRUE' : 'FALSE'}\t${cookie.path}\t${cookie.secure ? 'TRUE' : 'FALSE'}\t${Math.floor(cookie.expires || 0)}\t${cookie.name}\t${cookie.value}\n`;
      });

      const dataBlob = new Blob([netscapeFormat], { type: 'text/plain' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `google-flow-cookies-${Date.now()}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Form Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Google Flow Cookie Extractor</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Extract cookies from labs.google/fx/vi/tools/flow for video creation
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Google Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@gmail.com"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 pr-20"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-500 hover:text-blue-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium mb-2">
              Target URL (Optional)
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://labs.google/fx/vi/tools/flow"
              className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Cookies...
              </span>
            ) : (
              'Get Cookies'
            )}
          </button>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Results</h3>

          {result.success ? (
            <div className="space-y-4">
              {/* Page Info */}
              {result.pageInfo && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Page Information</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>URL:</strong> {result.pageInfo.url}</p>
                    <p><strong>Title:</strong> {result.pageInfo.title}</p>
                    <p><strong>Status:</strong> {result.pageInfo.ready}</p>
                  </div>
                </div>
              )}

              {/* Cookie Stats */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Cookie Statistics</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Google Cookies:</strong> {result.cookies?.length || 0}</p>
                  <p><strong>All Cookies:</strong> {result.allCookies?.length || 0}</p>
                  <p><strong>Timestamp:</strong> {result.timestamp}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyCookiesToClipboard}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={downloadCookiesAsJSON}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  Download as JSON
                </button>
                <button
                  onClick={downloadCookiesAsNetscape}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                >
                  Download as Netscape
                </button>
              </div>

              {/* Cookie Details */}
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Cookie Details ({result.cookies?.length || 0} cookies)</h4>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap break-all">
                    {JSON.stringify(result.cookies, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error</h4>
              <p className="text-sm text-red-700 dark:text-red-300">{result.error}</p>
              {result.details && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-2">{result.details}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Warning Section */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Security Warning</h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
          <li>Never share your Google credentials with untrusted services</li>
          <li>This tool runs in your browser environment</li>
          <li>Consider using an app-specific password instead of your main password</li>
          <li>Cookies contain sensitive authentication data - handle with care</li>
          <li>Clear cookies after use if needed for security</li>
        </ul>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import {
  parseCookies,
  filterGoogle,
  checkGoogleAuth,
  toHeaderString,
  toJson,
  toNetscape,
  type CookieFormat,
} from '@/lib/cookies';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ParseRequestBody {
  cookies?: string;
  format?: CookieFormat;
}

// Parses cookies the caller exported from a browser they are already signed
// in to. No login is performed and no credentials are accepted.
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ParseRequestBody;
    const raw = body.cookies;

    if (!raw || !raw.trim()) {
      return NextResponse.json(
        { error: 'No cookies provided. Paste exported cookies in the "cookies" field.' },
        { status: 400 }
      );
    }

    const all = parseCookies(raw, body.format ?? 'auto');

    if (all.length === 0) {
      return NextResponse.json(
        { error: 'No cookies could be parsed from the input.' },
        { status: 400 }
      );
    }

    const google = filterGoogle(all);
    const forExport = google.length ? google : all;

    return NextResponse.json({
      success: true,
      count: all.length,
      googleCount: google.length,
      auth: checkGoogleAuth(all),
      cookies: all,
      googleCookies: google,
      formats: {
        header: toHeaderString(forExport),
        json: toJson(all),
        netscape: toNetscape(all),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to parse cookies',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message:
      'POST exported cookies to parse and normalize them. No login or password required.',
    usage: {
      method: 'POST',
      body: {
        cookies: '<paste cookies: JSON array / Netscape cookies.txt / "name=value; name2=value2">',
        format: 'auto | json | netscape | header (optional, defaults to auto)',
      },
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CookieData {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

export async function POST(request: NextRequest) {
  let browser;

  try {
    const body = await request.json();
    const { email, password, url } = body;

    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required'
      }, { status: 400 });
    }

    const targetUrl = url || 'https://labs.google/fx/vi/tools/flow';

    // Launch browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080'
      ]
    });

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    // Navigate to Google Flow
    console.log('Navigating to Google Flow...');
    await page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait a bit for the page to load
    await page.waitForTimeout(2000);

    // Check if we need to login
    const isLoginPage = await page.evaluate(() => {
      return document.querySelector('input[type="email"]') !== null ||
             window.location.href.includes('accounts.google.com');
    });

    if (isLoginPage) {
      console.log('Login required, attempting to log in...');

      // Wait for email input
      await page.waitForSelector('input[type="email"]', { timeout: 10000 });

      // Enter email
      await page.type('input[type="email"]', email, { delay: 100 });

      // Click next button
      await page.click('button:has-text("Next"), #identifierNext');

      // Wait for password input
      await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await page.waitForTimeout(1000);

      // Enter password
      await page.type('input[type="password"]', password, { delay: 100 });

      // Click next/sign in button
      await page.click('button:has-text("Next"), #passwordNext');

      // Wait for navigation after login
      await page.waitForNavigation({
        waitUntil: 'networkidle2',
        timeout: 30000
      }).catch(() => {
        console.log('Navigation timeout, continuing...');
      });

      // Wait a bit more for any redirects
      await page.waitForTimeout(3000);
    }

    // Get all cookies
    const cookies = await page.cookies();

    // Filter for Google-related cookies
    const googleCookies = cookies.filter(cookie =>
      cookie.domain.includes('google.com') ||
      cookie.domain.includes('labs.google')
    );

    // Get page info
    const pageInfo = await page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      ready: document.readyState
    }));

    // Close browser
    await browser.close();

    return NextResponse.json({
      success: true,
      cookies: googleCookies,
      allCookies: cookies,
      pageInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting cookies:', error);

    if (browser) {
      await browser.close().catch(console.error);
    }

    return NextResponse.json({
      error: 'Failed to get cookies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'This endpoint requires POST request with email and password',
    usage: {
      method: 'POST',
      body: {
        email: 'your-google-email@gmail.com',
        password: 'your-password',
        url: 'https://labs.google/fx/vi/tools/flow (optional)'
      }
    }
  });
}

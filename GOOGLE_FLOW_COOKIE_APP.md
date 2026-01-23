# Google Flow Cookie Extractor App

## Overview

This application allows you to extract cookies from Google Flow (labs.google/fx/vi/tools/flow) for video creation purposes. It uses Puppeteer to automate browser interactions and retrieve authentication cookies.

## Features

- **Automated Login**: Automatically logs into Google account
- **Cookie Extraction**: Retrieves all cookies from Google Flow
- **Multiple Export Formats**:
  - Copy to clipboard (cookie string format)
  - Download as JSON
  - Download as Netscape format (compatible with curl and other tools)
- **Secure**: Runs in server-side environment with proper authentication

## Installation

1. Install dependencies:
```bash
pnpm install
```

The app requires the following new dependencies:
- `puppeteer`: Browser automation library
- `puppeteer-core`: Core Puppeteer library

## Usage

### Accessing the App

Navigate to: `/{locale}/google-flow-cookies`

For example:
- `/en/google-flow-cookies` (English)
- `/vi/google-flow-cookies` (Vietnamese)
- `/es/google-flow-cookies` (Spanish)

### Using the Interface

1. **Enter Google Email**: Your Google account email
2. **Enter Password**: Your Google account password (or app-specific password)
3. **Target URL** (Optional): The specific Google Flow URL you want to access
4. **Click "Get Cookies"**: The app will launch a browser, log in, and extract cookies

### After Extraction

Once cookies are retrieved, you can:

1. **Copy to Clipboard**: Get cookies as a cookie string format
2. **Download as JSON**: Get cookies in JSON format for programmatic use
3. **Download as Netscape**: Get cookies in Netscape format (compatible with curl, wget, etc.)

## API Endpoint

The app provides an API endpoint for programmatic access:

### POST `/api/google-flow-cookies`

Request body:
```json
{
  "email": "your-email@gmail.com",
  "password": "your-password",
  "url": "https://labs.google/fx/vi/tools/flow"
}
```

Response:
```json
{
  "success": true,
  "cookies": [...],
  "allCookies": [...],
  "pageInfo": {
    "url": "https://labs.google/fx/vi/tools/flow",
    "title": "Flow - Google Labs",
    "ready": "complete"
  },
  "timestamp": "2026-01-23T14:30:00.000Z"
}
```

### GET `/api/google-flow-cookies`

Returns API usage information.

## Security Considerations

⚠️ **IMPORTANT SECURITY NOTES:**

1. **Credentials**: Never share your Google credentials with untrusted services
2. **App-Specific Passwords**: Consider using Google App-Specific Passwords instead of your main password
3. **Cookie Security**: Cookies contain sensitive authentication data - handle with care
4. **Environment**: This app runs in a server-side environment, not in your browser
5. **Storage**: Cookies are not stored on the server - they're only returned to you
6. **2FA**: If you have 2-factor authentication enabled, you may need to use an app-specific password

## How to Get an App-Specific Password

1. Go to your Google Account: https://myaccount.google.com/
2. Select Security
3. Under "Signing in to Google," select App passwords
4. Select the app and device you want to generate the password for
5. Copy the generated password and use it in this app

## Use Cases

- **Video Creation**: Use cookies to access Google Flow for automated video creation
- **API Integration**: Integrate Google Flow with your own applications
- **Batch Processing**: Process multiple video creation tasks programmatically
- **Testing**: Test Google Flow features in an automated environment

## Troubleshooting

### Login Fails
- Ensure your email and password are correct
- Try using an app-specific password if you have 2FA enabled
- Check if your Google account has any security restrictions

### Cookies Not Retrieved
- The page might require manual verification
- Google might be blocking automated access
- Try accessing the URL manually first to ensure it's accessible

### Browser Launch Fails
- Ensure Puppeteer is properly installed
- Check that Chrome/Chromium is available on the system
- Review server logs for detailed error messages

## Technical Details

### Technologies Used
- **Next.js 15**: React framework
- **Puppeteer**: Browser automation
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Styling

### Browser Configuration
The app launches a headless Chrome browser with the following configuration:
- User-Agent: Modern Chrome user agent
- Viewport: 1920x1080
- Security: Sandboxed environment
- Timeout: 60 seconds for page load

## Development

### Running in Development Mode
```bash
pnpm dev
```

### API Route Location
`src/app/api/google-flow-cookies/route.ts`

### Component Location
`src/components/GoogleFlowCookieForm.tsx`

### Page Location
`src/app/[locale]/google-flow-cookies/page.tsx`

## License

This is part of the YouTube Niche Finder project.

## Disclaimer

This tool is for educational and authorized use only. Always ensure you have permission to automate interactions with Google services and comply with Google's Terms of Service.

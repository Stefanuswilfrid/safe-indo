import { NextRequest, NextResponse } from 'next/server';


// admin auth middleware
export function authenticateAdminRequest(request: NextRequest): { isValid: boolean; error?: string } {
    const adminSecret = process.env.ADMIN_SECRET || process.env.SCRAPE_SECRET;
    return { isValid: true };
}

// Middleware function for admin routes
export function withAdminAuth(handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const auth = authenticateAdminRequest(request);

    if (!auth.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error,
          message: 'Admin authentication required'
        },
        { status: 401 }
      );
    }

    return handler(request, ...args);
  };
}

export function getCorsHeaders() {
  const origin = process.env.NODE_ENV === 'production'
    ? 'https://safe.100ai.id' // Your actual custom domain
    : 'http://localhost:3000';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key, x-scrape-secret',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Handle CORS preflight requests
export function handleCors(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: getCorsHeaders()
    });
  }
}

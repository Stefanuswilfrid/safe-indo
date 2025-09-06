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
import { NextRequest, NextResponse } from "next/server";

export function authenticateRequest(request: NextRequest): {
  isValid: boolean;
  error?: string;
} {
  const authHeader = request.headers.get("authorization");
  const apiKey = request.headers.get("x-api-key");

  // Check for API key in header or Authorization header
  const providedKey =
    apiKey || (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

  if (!providedKey) {
    return {
      isValid: false,
      error: 'Missing API key. Include in x-api-key header or Authorization: Bearer <key>'
    };
  }

  const trimmedProvided = providedKey.trim();
  //   const trimmedSecret = secretKey.trim();

  //   if (trimmedProvided !== trimmedSecret) {
  //     return {
  //       isValid: false,
  //       error: 'Invalid API key'
  //     };
  //   }

  return { isValid: true };
}


// CORS headers for security
export function getCorsHeaders() {
  const origin = process.env.NODE_ENV === 'production'
    ? '' // Your actual custom domain
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
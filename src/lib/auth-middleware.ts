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

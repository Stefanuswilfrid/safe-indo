import { getCorsHeaders, handleCors } from '@/lib/admin-middleware';
import { NextRequest, NextResponse } from 'next/server';

const HOAX_KEYWORDS = [
  'hoax', 'bohong', 'palsu', 'penipuan', 'scam', 'tipu', 'manipulasi',
  'turnbackhoax', 'cek fakta', 'verifikasi', 'bantah', 'klarifikasi',
  'disinformasi', 'misinformasi', 'propaganda', 'fitnah', 'hasut'
];

// Simple hash-based embedding function (matches generate-embeddings.js)
function generateSimpleEmbedding(text: string): number[] {
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);

  const vector = [];
  for (let i = 0; i < 1536; i++) {
    vector.push((Math.sin(hash + i) + 1) / 2);
  }
  return vector;
}

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  return NextResponse.json({
    success: true,
    message: "Safe Indonesia Chat API - POST your questions here!",
    example: {
      message: "ada demo dimana?",
      context: {
        currentView: "jakarta",
        timeRange: "last_24h"
      }
    }
  }, { headers: getCorsHeaders() });
}
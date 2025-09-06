import { authenticateAdminRequest } from "@/lib/admin-middleware";
import { NextRequest,NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

        
    } catch (error) {
        console.error('❌ Twitter data API error:', error);
        return NextResponse.json(
        { 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error occurred' 
        },
        { status: 500 }
        );
        
    }
}
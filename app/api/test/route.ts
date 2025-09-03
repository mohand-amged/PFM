import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Test endpoint called');
    return NextResponse.json(
      { 
        message: 'Test endpoint working',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { error: 'Test endpoint failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Test POST endpoint called');
    const body = await request.json();
    console.log('Request body:', body);
    
    return NextResponse.json(
      { 
        message: 'Test POST endpoint working',
        receivedData: body,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test POST endpoint error:', error);
    return NextResponse.json(
      { error: 'Test POST endpoint failed' },
      { status: 500 }
    );
  }
}

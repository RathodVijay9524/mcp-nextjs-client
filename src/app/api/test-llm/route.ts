import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'LLM test endpoint is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  try {
    // Simple test message
    const testResponse = "Hello! This is a test response from the LLM API.";
    
    return NextResponse.json({ 
      success: true,
      response: testResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('LLM test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

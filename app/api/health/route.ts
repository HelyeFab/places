import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check
    const timestamp = new Date().toISOString()

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp,
        service: 'places-app',
        version: '1.0.0'
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
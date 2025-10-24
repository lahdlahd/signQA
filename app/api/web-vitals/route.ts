import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    console.info('Core Web Vital', payload);
  } catch (error) {
    console.warn('Unable to parse Core Web Vitals payload', error);
  }

  return NextResponse.json({ received: true }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
}

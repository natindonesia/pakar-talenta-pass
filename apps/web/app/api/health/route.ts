import { NextResponse } from 'next/server';

// Liveness/readiness probe. Deliberately does not touch the database, so a
// DB outage shows up in the app's own endpoints, not as a restart loop.
export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({ status: 'ok' });
}

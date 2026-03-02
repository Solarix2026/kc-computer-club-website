/* eslint-disable prettier/prettier */
import { NextResponse } from 'next/server';

/**
 * Admin login is handled client-side via auth.service.ts directly.
 * This stub exists to satisfy Next.js route type validation.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Use the client-side auth service for admin login' },
    { status: 405 }
  );
}

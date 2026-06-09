import { NextRequest, NextResponse } from 'next/server';
import { removeSessionCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  removeSessionCookie(response);
  return response;
}


import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

import { broadcastEvent } from '@/lib/events';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    // If super admin, return all settings
    if (currentUser && currentUser.role === 'SUPER_ADMIN') {
      const settings = await prisma.systemSetting.findMany();
      return NextResponse.json({ settings });
    }

    // Otherwise return only public settings
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ['system_name', 'allow_signup'] },
      },
    });
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { settings } = body; // Array of { key, value }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    for (const item of settings) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: String(item.value) },
        create: { key: item.key, value: String(item.value) },
      });
    }

    broadcastEvent({ type: 'SYSTEM_SETTINGS_UPDATED' });

    return NextResponse.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


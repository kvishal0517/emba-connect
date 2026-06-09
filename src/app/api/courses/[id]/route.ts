import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

import { broadcastEvent } from '@/lib/events';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser(request);
    if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { code, name, description, term, professorId } = body;

    // Check code unique if changing
    if (code) {
      const existing = await prisma.course.findFirst({
        where: { code, NOT: { id } }
      });
      if (existing) {
        return NextResponse.json({ error: 'Course code already exists' }, { status: 400 });
      }
    }

    const course = await prisma.course.update({
      where: { id },
      data: {
        code,
        name,
        description,
        term,
        professorId: professorId === '' ? null : professorId
      },
      include: {
        professor: {
          select: { id: true, name: true }
        }
      }
    });

    broadcastEvent({ type: 'COURSES_UPDATED' });

    return NextResponse.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser(request);
    if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.course.delete({
      where: { id }
    });

    broadcastEvent({ type: 'COURSES_UPDATED' });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

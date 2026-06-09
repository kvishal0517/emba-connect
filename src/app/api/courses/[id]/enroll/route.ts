import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { broadcastEvent } from '@/lib/events';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: courseId } = await context.params;
    const currentUser = await getCurrentUser(request);
    if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const body = await request.clone().json().catch(() => ({}));
    const { studentIds } = body as { studentIds: string[] };

    if (!Array.isArray(studentIds)) {
      return NextResponse.json({ error: 'studentIds array is required' }, { status: 400 });
    }

    // Sync enrollments
    await prisma.$transaction([
      prisma.enrollment.deleteMany({
        where: { courseId }
      }),
      prisma.enrollment.createMany({
        data: studentIds.map(studentId => ({
          courseId,
          studentId
        }))
      })
    ]);

    // Send notifications to enrolled students
    for (const studentId of studentIds) {
      await createNotification({
        userId: studentId,
        title: 'Course Enrollment Update',
        message: `You have been enrolled in the course: ${course.code} - ${course.name}.`
      });
    }

    broadcastEvent({ type: 'COURSES_UPDATED' });

    return NextResponse.json({ message: 'Enrollments updated successfully' });
  } catch (error) {
    console.error('Enroll students error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

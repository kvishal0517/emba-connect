import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

import { broadcastEvent } from '@/lib/events';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: classId } = await context.params;
    const currentUser = await getCurrentUser(request);

    if (!currentUser || (currentUser.role !== 'PROFESSOR' && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const scheduledClass = await prisma.scheduledClass.findUnique({
      where: { id: classId },
      select: { courseId: true }
    });

    if (!scheduledClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // List only students enrolled in this course
    const enrollments = await prisma.enrollment.findMany({
      where: { 
        courseId: scheduledClass.courseId,
        student: { status: 'APPROVED' }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    const students = enrollments.map(e => e.student).sort((a, b) => a.name.localeCompare(b.name));

    const attendances = await prisma.attendance.findMany({
      where: { classId },
    });

    const attendanceSheet = students.map((student) => {
      const record = attendances.find((a) => a.studentId === student.id);
      return {
        studentId: student.id,
        name: student.name,
        email: student.email,
        markedAt: record ? record.markedAt : null,
        status: record ? record.status : 'ABSENT',
      };
    });

    return NextResponse.json({ attendances: attendanceSheet });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: classId } = await context.params;
    const currentUser = await getCurrentUser(request);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const scheduledClass = await prisma.scheduledClass.findUnique({
      where: { id: classId },
    });

    if (!scheduledClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const body = await request.clone().json().catch(() => ({}));
    const { studentId, status } = body;

    // Case 1: Professor/Admin manual override
    if (studentId && status) {
      if (currentUser.role !== 'PROFESSOR' && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const attendance = await prisma.attendance.upsert({
        where: {
          classId_studentId: {
            classId,
            studentId,
          },
        },
        update: { status },
        create: {
          classId,
          studentId,
          status,
        },
      });

      broadcastEvent({ type: 'ATTENDANCE_UPDATED' });
      return NextResponse.json({ message: 'Attendance updated successfully', attendance });
    }

    // Case 2: Student self check-in
    if (currentUser.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Time window check: Student can check in from 15 minutes before class starts
    // up to 15 minutes after class ends.
    const now = new Date();
    const startTime = new Date(scheduledClass.startTime);
    const endTime = new Date(startTime.getTime() + scheduledClass.duration * 60 * 1000);

    const windowStart = new Date(startTime.getTime() - 15 * 60 * 1000); // 15 mins early
    const windowEnd = new Date(endTime.getTime() + 15 * 60 * 1000); // 15 mins late

    if (now < windowStart) {
      return NextResponse.json({ error: 'Class check-in has not opened yet' }, { status: 400 });
    }

    if (now > windowEnd) {
      return NextResponse.json({ error: 'Class check-in is now closed' }, { status: 400 });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        classId_studentId: {
          classId,
          studentId: currentUser.id,
        },
      },
      update: { status: 'PRESENT' },
      create: {
        classId,
        studentId: currentUser.id,
        status: 'PRESENT',
      },
    });

    broadcastEvent({ type: 'ATTENDANCE_UPDATED' });

    return NextResponse.json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    console.error('Mark attendance error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

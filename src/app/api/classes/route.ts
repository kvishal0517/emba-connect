import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

import { createNotification } from '@/lib/notifications';
import { broadcastEvent } from '@/lib/events';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filterCourseId = searchParams.get('courseId');

    const whereClause: any = {};

    if (currentUser.role === 'STUDENT') {
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: currentUser.id },
        select: { courseId: true }
      });
      const courseIds = enrollments.map(e => e.courseId);
      
      if (filterCourseId && filterCourseId !== 'ALL') {
        if (courseIds.includes(filterCourseId)) {
          whereClause.courseId = filterCourseId;
        } else {
          return NextResponse.json({ classes: [] });
        }
      } else {
        whereClause.courseId = { in: courseIds };
      }
    } else if (currentUser.role === 'PROFESSOR') {
      const taughtCourses = await prisma.course.findMany({
        where: { professorId: currentUser.id },
        select: { id: true }
      });
      const courseIds = taughtCourses.map(c => c.id);

      if (filterCourseId && filterCourseId !== 'ALL') {
        if (courseIds.includes(filterCourseId)) {
          whereClause.courseId = filterCourseId;
        } else {
          return NextResponse.json({ classes: [] });
        }
      } else {
        whereClause.courseId = { in: courseIds };
      }
    } else {
      if (filterCourseId && filterCourseId !== 'ALL') {
        whereClause.courseId = filterCourseId;
      }
    }

    const classes = await prisma.scheduledClass.findMany({
      where: whereClause,
      include: {
        scheduledBy: {
          select: { name: true },
        },
        course: {
          select: { code: true, name: true }
        },
        _count: {
          select: { attendances: true },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    // If student, attach their attendance status for each class
    if (currentUser.role === 'STUDENT') {
      const studentAttendances = await prisma.attendance.findMany({
        where: { studentId: currentUser.id },
      });

      const classesWithAttendance = classes.map((item) => {
        const attendance = studentAttendances.find((a) => a.classId === item.id);
        return {
          ...item,
          myAttendance: attendance
            ? {
                id: attendance.id,
                markedAt: attendance.markedAt,
                status: attendance.status,
              }
            : null,
        };
      });

      return NextResponse.json({ classes: classesWithAttendance });
    }

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Fetch classes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || (currentUser.role !== 'PROFESSOR' && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { topic, description, startTime, duration, zoomLink, courseId } = body;

    if (!topic || !startTime || !duration || !zoomLink || !courseId) {
      return NextResponse.json({ error: 'Topic, Start Time, Duration, Zoom Link, and Course are required' }, { status: 400 });
    }

    const scheduledClass = await prisma.scheduledClass.create({
      data: {
        topic,
        description,
        startTime: new Date(startTime),
        duration: Number(duration),
        zoomLink,
        scheduledById: currentUser.id,
        courseId,
      },
    });

    // Notify only students enrolled in this course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { code: true, name: true }
    });

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      select: { studentId: true }
    });

    for (const enrollment of enrollments) {
      await createNotification({
        userId: enrollment.studentId,
        title: 'New Class Scheduled',
        message: `A new session "${topic}" has been scheduled for ${course?.code || ''} on ${new Date(startTime).toLocaleString()}. Zoom link available on dashboard.`,
      });
    }

    broadcastEvent({ type: 'CLASSES_UPDATED' });

    return NextResponse.json({
      message: 'Class scheduled successfully',
      class: scheduledClass,
    });
  } catch (error) {
    console.error('Schedule class error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

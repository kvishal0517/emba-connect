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
          return NextResponse.json({ assignments: [] });
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
          return NextResponse.json({ assignments: [] });
        }
      } else {
        whereClause.courseId = { in: courseIds };
      }
    } else {
      if (filterCourseId && filterCourseId !== 'ALL') {
        whereClause.courseId = filterCourseId;
      }
    }

    // List assignments
    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: { name: true },
        },
        course: {
          select: { code: true, name: true }
        },
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // If student, attach their specific submission status to each assignment
    if (currentUser.role === 'STUDENT') {
      const studentSubmissions = await prisma.submission.findMany({
        where: { studentId: currentUser.id },
      });

      const assignmentsWithSubmission = assignments.map((assignment) => {
        const submission = studentSubmissions.find((s) => s.assignmentId === assignment.id);
        return {
          ...assignment,
          mySubmission: submission
            ? {
                id: submission.id,
                fileName: submission.fileName,
                submittedAt: submission.submittedAt,
                grade: submission.grade,
                feedback: submission.feedback,
                gradedAt: submission.gradedAt,
              }
            : null,
        };
      });

      return NextResponse.json({ assignments: assignmentsWithSubmission });
    }

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Fetch assignments error:', error);
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
    const { title, description, dueDate, courseId } = body;

    if (!title || !dueDate || !courseId) {
      return NextResponse.json({ error: 'Title, Due Date, and Course are required' }, { status: 400 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        createdById: currentUser.id,
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
        title: 'New Assignment Posted',
        message: `A new assignment "${title}" has been posted for ${course?.code || ''}. Due date: ${new Date(dueDate).toLocaleDateString()}.`,
      });
    }

    broadcastEvent({ type: 'ASSIGNMENTS_UPDATED' });

    return NextResponse.json({
      message: 'Assignment created successfully',
      assignment,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

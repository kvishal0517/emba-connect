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
          return NextResponse.json({ syllabi: [] });
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
          return NextResponse.json({ syllabi: [] });
        }
      } else {
        whereClause.courseId = { in: courseIds };
      }
    } else {
      if (filterCourseId && filterCourseId !== 'ALL') {
        whereClause.courseId = filterCourseId;
      }
    }

    const syllabi = await prisma.syllabus.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: { name: true },
        },
        course: {
          select: { code: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ syllabi });
  } catch (error) {
    console.error('Fetch syllabi error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || (currentUser.role !== 'PROFESSOR' && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title') as string | null;
    const description = formData.get('description') as string | null;
    const courseId = formData.get('courseId') as string | null;

    if (!file || !title || !courseId) {
      return NextResponse.json({ error: 'File, Title, and Course are required' }, { status: 400 });
    }

    // Convert file to ArrayBuffer and then Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create syllabus record
    const syllabus = await prisma.syllabus.create({
      data: {
        title,
        description,
        fileName: file.name,
        fileType: file.type,
        fileData: buffer,
        uploadedById: currentUser.id,
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
        title: 'New Syllabus Uploaded',
        message: `Professor ${currentUser.name} uploaded a new syllabus for ${course?.code || ''}: "${title}".`,
      });
    }

    broadcastEvent({ type: 'SYLLABUS_UPDATED' });

    return NextResponse.json({
      message: 'Syllabus uploaded and shared successfully',
      syllabus: {
        id: syllabus.id,
        title: syllabus.title,
        fileName: syllabus.fileName,
      },
    });
  } catch (error) {
    console.error('Upload syllabus error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

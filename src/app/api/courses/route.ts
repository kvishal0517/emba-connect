import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

import { broadcastEvent } from '@/lib/events';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let courses;

    if (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'ADMIN') {
      courses = await prisma.course.findMany({
        include: {
          professor: {
            select: { id: true, name: true, email: true }
          },
          enrollments: {
            include: {
              student: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: { enrollments: true }
          }
        },
        orderBy: { code: 'asc' }
      });
    } else if (currentUser.role === 'PROFESSOR') {
      courses = await prisma.course.findMany({
        where: { professorId: currentUser.id },
        include: {
          enrollments: {
            include: {
              student: {
                select: { id: true, name: true, email: true }
              }
            }
          },
          _count: {
            select: { enrollments: true }
          }
        },
        orderBy: { code: 'asc' }
      });
    } else {
      // Student: return only courses they are enrolled in
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: currentUser.id },
        select: { courseId: true }
      });
      const courseIds = enrollments.map(e => e.courseId);

      courses = await prisma.course.findMany({
        where: { id: { in: courseIds } },
        include: {
          professor: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { code: 'asc' }
      });
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Fetch courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { code, name, description, term, professorId } = body;

    if (!code || !name || !term) {
      return NextResponse.json({ error: 'Course code, name, and term are required' }, { status: 400 });
    }

    // Check code unique
    const existing = await prisma.course.findUnique({
      where: { code }
    });
    if (existing) {
      return NextResponse.json({ error: 'Course code already exists' }, { status: 400 });
    }

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description,
        term,
        professorId: professorId || null
      },
      include: {
        professor: {
          select: { id: true, name: true }
        }
      }
    });

    broadcastEvent({ type: 'COURSES_UPDATED' });

    return NextResponse.json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

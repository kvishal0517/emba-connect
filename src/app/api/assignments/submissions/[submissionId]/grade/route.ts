import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

import { createNotification } from '@/lib/notifications';
import { broadcastEvent } from '@/lib/events';

type RouteContext = {
  params: Promise<{ submissionId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { submissionId } = await context.params;
    const currentUser = await getCurrentUser(request);

    if (!currentUser || (currentUser.role !== 'PROFESSOR' && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { grade, feedback } = body;

    if (!grade) {
      return NextResponse.json({ error: 'Grade is required' }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
        student: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update grade in database
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        grade: String(grade),
        feedback: feedback || null,
        gradedById: currentUser.id,
        gradedAt: new Date(),
      },
    });

    // Notify the student
    await createNotification({
      userId: submission.studentId,
      title: 'Assignment Graded',
      message: `Your submission for "${submission.assignment.title}" has been graded. Grade: ${grade}.`,
    });

    broadcastEvent({ type: 'SUBMISSIONS_UPDATED' });

    return NextResponse.json({
      message: 'Submission graded successfully',
      submission: {
        id: updatedSubmission.id,
        grade: updatedSubmission.grade,
        feedback: updatedSubmission.feedback,
      },
    });
  } catch (error) {
    console.error('Grading error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

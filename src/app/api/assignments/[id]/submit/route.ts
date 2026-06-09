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
    const { id: assignmentId } = await context.params;
    const currentUser = await getCurrentUser(request);

    if (!currentUser || currentUser.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Forbidden: Only students can submit assignments' }, { status: 403 });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Check if submission already exists (update/resubmit if yes)
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId,
        studentId: currentUser.id,
      },
    });

    let submission;
    if (existingSubmission) {
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileName: file.name,
          fileType: file.type,
          fileData: buffer,
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: currentUser.id,
          fileName: file.name,
          fileType: file.type,
          fileData: buffer,
        },
      });
    }

    // Notify the professor who created the assignment
    await createNotification({
      userId: assignment.createdById,
      title: 'New Assignment Submission',
      message: `Student "${currentUser.name}" has submitted their response for "${assignment.title}".`,
    });

    broadcastEvent({ type: 'SUBMISSIONS_UPDATED' });

    return NextResponse.json({
      message: 'Assignment submitted successfully',
      submissionId: submission.id,
    });
  } catch (error) {
    console.error('Assignment submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // "syllabus" or "submission"

    if (!id || !type) {
      return NextResponse.json({ error: 'ID and Type are required' }, { status: 400 });
    }

    if (type === 'syllabus') {
      const syllabus = await prisma.syllabus.findUnique({
        where: { id },
      });

      if (!syllabus) {
        return NextResponse.json({ error: 'Syllabus not found' }, { status: 404 });
      }

      // Stream file data back
      const buffer = Buffer.from(syllabus.fileData);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': syllabus.fileType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(syllabus.fileName)}"`,
        },
      });
    } 
    
    if (type === 'submission') {
      const submission = await prisma.submission.findUnique({
        where: { id },
        include: { student: true }
      });

      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
      }

      // Access validation: Students can only download their own submissions
      if (currentUser.role === 'STUDENT' && submission.studentId !== currentUser.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Stream file data back
      const buffer = Buffer.from(submission.fileData);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': submission.fileType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(submission.fileName)}"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


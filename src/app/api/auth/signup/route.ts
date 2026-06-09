import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, setSessionCookie } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { broadcastEvent } from '@/lib/events';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    const lowercaseEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: lowercaseEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already registered' },
        { status: 400 }
      );
    }

    // Validate role
    const allowedRoles = ['ADMIN', 'PROFESSOR', 'STUDENT'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid signup role' },
        { status: 400 }
      );
    }

    // Check if approval is required in system settings
    const requireApprovalSetting = await prisma.systemSetting.findUnique({
      where: { key: 'require_approval' },
    });
    
    // Default to PENDING for students/professors, unless explicitly set to false
    let initialStatus = 'APPROVED';
    if (requireApprovalSetting?.value === 'true' && (role === 'STUDENT' || role === 'PROFESSOR' || role === 'ADMIN')) {
      initialStatus = 'PENDING';
    }

    const passwordHash = await hashPassword(password);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        email: lowercaseEmail,
        name,
        role,
        status: initialStatus,
        passwordHash,
      },
    });

    // If pending approval, notify all admins/super admins
    if (initialStatus === 'PENDING') {
      const adminsAndSuperAdmins = await prisma.user.findMany({
        where: {
          role: { in: ['ADMIN', 'SUPER_ADMIN'] },
        },
      });

      for (const admin of adminsAndSuperAdmins) {
        await createNotification({
          userId: admin.id,
          title: 'New Registration Pending',
          message: `A new user "${name}" has registered as a ${role.toLowerCase()} and is pending approval.`,
        });
      }

      broadcastEvent({ type: 'USERS_UPDATED' });
    }

    const payload = {
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
    };

    const response = NextResponse.json({
      message: 'Signup successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
      },
    });

    // Log the user in by setting the session cookie
    await setSessionCookie(response, payload);
    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


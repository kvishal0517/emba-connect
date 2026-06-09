import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { broadcastEvent } from '@/lib/events';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser(request);

    if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Admins cannot edit admins or super admins
    if (currentUser.role === 'ADMIN' && (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admins cannot modify admin/super admin details' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, role, status } = body;

    // Admins cannot change someone's role to ADMIN or SUPER_ADMIN
    if (currentUser.role === 'ADMIN' && role && (role === 'ADMIN' || role === 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admins cannot promote users to admin roles' }, { status: 403 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    if (password) {
      updateData.passwordHash = await hashPassword(password);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // If target user's status was approved, create a notification for them
    if (status === 'APPROVED' && targetUser.status !== 'APPROVED') {
      await createNotification({
        userId: targetUser.id,
        title: 'Account Approved',
        message: 'Your registration has been approved. You now have full access to your dashboard.',
      });
    }

    broadcastEvent({ type: 'USERS_UPDATED' });

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const currentUser = await getCurrentUser(request);

    if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Users cannot delete themselves
    if (currentUser.id === id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Admins cannot delete admins or super admins
    if (currentUser.role === 'ADMIN' && (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admins cannot delete admin/super admin users' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id },
    });

    broadcastEvent({ type: 'USERS_UPDATED' });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

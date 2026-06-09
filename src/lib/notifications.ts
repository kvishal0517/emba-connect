import { prisma } from './db';
import { broadcastEvent } from './events';

export async function createNotification(data: { userId: string; title: string; message: string }) {
  const notification = await prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
    },
  });

  // Broadcast real-time notifications event to the targeted user
  broadcastEvent({
    type: 'NOTIFICATIONS_UPDATED',
    userId: data.userId,
  });

  return notification;
}

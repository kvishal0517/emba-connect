import { NextRequest } from 'next/server';
import { eventEmitter, REALTIME_EVENT, RealtimeEvent } from '@/lib/events';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const currentUser = await getCurrentUser(request);

  if (!currentUser) {
    return new Response('Unauthorized', { status: 401 });
  }

  const responseHeaders = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  };

  const stream = new ReadableStream({
    start(controller) {
      // Send initial keep-alive comment
      controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));

      // Event listener callback
      const onEvent = (event: RealtimeEvent) => {
        // If a userId is specified on the event, only send to that specific user
        if (event.userId && event.userId !== currentUser.id) {
          return;
        }

        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
      };

      eventEmitter.on(REALTIME_EVENT, onEvent);

      // Clean up connection when request is aborted (client disconnects)
      request.signal.addEventListener('abort', () => {
        eventEmitter.off(REALTIME_EVENT, onEvent);
      });
    },
  });

  return new Response(stream, { headers: responseHeaders });
}

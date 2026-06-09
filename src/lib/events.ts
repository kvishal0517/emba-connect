import { EventEmitter } from 'events';

const globalForEvents = global as unknown as { eventEmitter: EventEmitter };

export const eventEmitter = globalForEvents.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventEmitter = eventEmitter;
}

export const REALTIME_EVENT = 'realtime-event';

export interface RealtimeEvent {
  type: string;
  userId?: string;
  payload?: any;
}

export function broadcastEvent(event: RealtimeEvent) {
  eventEmitter.emit(REALTIME_EVENT, event);
}

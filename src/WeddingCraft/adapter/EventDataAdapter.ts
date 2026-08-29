import { EventDataInput } from '../types';

export class EventDataAdapter {
  private externalAPI: any;

  constructor(externalAPI: any) {
    this.externalAPI = externalAPI;
  }

  async getCurrentEvent(): Promise<EventDataInput> {
    const lockStatus = await this.checkEditLock();
    if (lockStatus.lockedByOther) {
      throw new Error(`Conflict: Edición bloqueada por usuario ${lockStatus.user}`);
    }

    // Mock API call to existing system
    const rawData = typeof this.externalAPI.getEventData === 'function' 
      ? await this.externalAPI.getEventData()
      : this.externalAPI;

    // Map to strictly typed EventDataInput
    return {
      eventId: rawData.id || rawData.eventId || 'unknown',
      coupleNames: rawData.coupleNames || ['Nombre 1', 'Nombre 2'],
      eventDate: rawData.date || rawData.eventDate || new Date().toISOString(),
      venueName: rawData.venue?.name || rawData.venueName || undefined,
      venueAddress: rawData.venue?.address || rawData.venueAddress || undefined,
      isReadOnly: true, // Force read-only mode for parent data
    };
  }

  private async checkEditLock(): Promise<{ lockedByOther: boolean; user?: string }> {
    // In a real scenario, this checks the parent DB for an active editing session
    return { lockedByOther: false };
  }
}

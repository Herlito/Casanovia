import { EventDataInput } from '../types';

export class EventDataAdapter {
  private api: any;

  constructor(externalAPI?: any) {
    this.api = externalAPI;
  }

  async getCurrentEvent(): Promise<EventDataInput> {
    if (!this.api) {
      return {
        eventId: 'demo_event',
        coupleNames: ['Erika', 'Yemar'],
        coupleNamesText: 'Erika & Yemar',
        brideName: 'Erika',
        groomName: 'Yemar',
        eventDate: new Date().toISOString(),
        venueName: 'Salón de Recepciones',
        venueAddress: '',
        romanticQuote: '',
      };
    }

    try {
      let rawData: any = null;
      if (typeof this.api.getEventData === 'function') {
        rawData = await this.api.getEventData();
      } else if (typeof this.api === 'object') {
        rawData = this.api;
      }

      if (!rawData) {
        return {
          eventId: 'demo_event',
          coupleNames: ['Erika', 'Yemar'],
          eventDate: new Date().toISOString(),
        };
      }

      const coupleNames: [string, string] = Array.isArray(rawData.coupleNames) && rawData.coupleNames.length >= 2
        ? [rawData.coupleNames[0] || 'Novio', rawData.coupleNames[1] || 'Novia']
        : rawData.coupleNamesText?.includes(' & ')
        ? (rawData.coupleNamesText.split(' & ') as [string, string])
        : [rawData.groomName || 'Novio', rawData.brideName || 'Novia'];

      return {
        eventId: rawData.eventId || 'demo_event',
        coupleNames,
        coupleNamesText: rawData.coupleNamesText || `${coupleNames[0]} & ${coupleNames[1]}`,
        brideName: rawData.brideName || coupleNames[1] || 'Novia',
        groomName: rawData.groomName || coupleNames[0] || 'Novio',
        eventDate: rawData.eventDate || new Date().toISOString(),
        venueName: rawData.venueName || 'Salón de Recepciones',
        venueAddress: rawData.venueAddress || '',
        romanticQuote: rawData.romanticQuote || '',
        ceremonyVenue: rawData.ceremonyVenue,
        receptionVenue: rawData.receptionVenue,
        additionalVenues: rawData.additionalVenues || [],
        hasReligiousCeremony: rawData.hasReligiousCeremony,
        dressCodeStyle: rawData.dressCodeStyle,
        dressCodeDescription: rawData.dressCodeDescription,
        suggestedColors: rawData.suggestedColors,
        sampleWishes: rawData.sampleWishes || [],
        onSyncSettings: this.api.syncSettings
          ? async (updates: any) => {
              await this.api.syncSettings(updates);
            }
          : undefined,
      };
    } catch (err) {
      console.warn('[EventDataAdapter] Error fetching event data:', err);
      return {
        eventId: 'demo_event',
        coupleNames: ['Erika', 'Yemar'],
        eventDate: new Date().toISOString(),
      };
    }
  }

  static adaptWeddingToDocument(wedding: any) {
    return null;
  }

  static adaptDocumentToWedding(doc: any) {
    return {};
  }
}

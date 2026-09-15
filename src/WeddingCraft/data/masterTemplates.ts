import { WeddingDesignDocument } from '../types';
import { TemplateItem } from '../store/useEditorStore';
import { createDefaultWebInvitationDocument } from '../lib/defaultWebTemplate';
import { predefinedThemes } from '../themes';
import { v4 as uuidv4 } from 'uuid';

/**
 * Curated list of restored master templates for WeddingCraft
 */
export const RESTORED_MASTER_TEMPLATES: TemplateItem[] = [
  {
    id: 'template-zenaida-ronny',
    name: 'Boda Zenaida & Ronny (Arequipa Colonial)',
    author: 'Zenaida Anahua & Herly Lizarazo',
    createdAt: new Date('2026-08-17T00:00:00Z').getTime(),
    updatedAt: new Date('2026-09-12T00:00:00Z').getTime(),
    document: createDefaultWebInvitationDocument({
      eventId: 'boda-zenaida-ronny',
      coupleNames: ['Zenaida', 'Ronny'],
      eventDate: '2026-09-12T17:00:00',
      venueName: 'Basílica Catedral & Fundo Colonial El Carmen',
      venueAddress: 'Yanahuara, Arequipa',
      romanticQuote: 'Y recuerda, tal y como estaba escrito, que querer a otra persona es ver la cara de Dios. Querer a alguien y que nos quieran es la bendición más grande.',
      canvasWidth: 720,
      canvasHeight: 980
    })
  },
  {
    id: 'template-sofia-alejandro',
    name: 'Boda Sofía & Alejandro (Editorial Clásico)',
    author: 'Romina & Herly Lizarazo',
    createdAt: new Date('2026-08-01T00:00:00Z').getTime(),
    updatedAt: new Date('2026-09-10T00:00:00Z').getTime(),
    document: createDefaultWebInvitationDocument({
      eventId: 'boda-sofia-alejandro',
      coupleNames: ['Sofía', 'Alejandro'],
      eventDate: '2026-10-24T18:00:00',
      venueName: 'Parroquia Nuestra Señora del Pilar & Club Campestre',
      venueAddress: 'San Isidro, Lima',
      romanticQuote: 'El amor no consiste en mirarse el uno al otro, sino en mirar juntos en la misma dirección.',
      canvasWidth: 720,
      canvasHeight: 980
    })
  },
  {
    id: 'template-valentina-mateo',
    name: 'Boda Valentina & Mateo (Jardín & Botánica)',
    author: 'Romina & Herly Lizarazo',
    createdAt: new Date('2026-08-15T00:00:00Z').getTime(),
    updatedAt: new Date('2026-09-05T00:00:00Z').getTime(),
    document: createDefaultWebInvitationDocument({
      eventId: 'boda-valentina-mateo',
      coupleNames: ['Valentina', 'Mateo'],
      eventDate: '2026-12-19T16:30:00',
      venueName: 'Casona Queirolo & Viñedos',
      venueAddress: 'Valle de Pachacámac, Lima',
      romanticQuote: 'Tú eres mi hoy y todos mis mañanas.',
      canvasWidth: 720,
      canvasHeight: 980
    })
  },
  {
    id: 'template-minimal-rose',
    name: 'Romance Sunset & Oro Rosa',
    author: 'WeddingCraft Studio',
    createdAt: new Date('2026-07-20T00:00:00Z').getTime(),
    updatedAt: new Date('2026-09-01T00:00:00Z').getTime(),
    document: {
      ...createDefaultWebInvitationDocument({
        eventId: 'template_rose',
        coupleNames: ['Camila', 'Sebastián'],
        eventDate: '2027-02-14T19:00:00',
        venueName: 'Hacienda Los Ficus',
        venueAddress: 'Cieneguilla',
        romanticQuote: 'Donde reina el amor, sobran las leyes.',
        canvasWidth: 720,
        canvasHeight: 980
      }),
      theme: predefinedThemes[1] || predefinedThemes[0]
    }
  }
];

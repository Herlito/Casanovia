export const initialGuests = [];
export const initialTimeline = [];
export const initialBudget = [];
export const initialWeddingSettings = {
  coupleNames: 'Erika & Yemar',
  weddingDate: '2026-11-28',
  location: 'Lima, Perú',
  rsvpDeadline: '2026-11-01',
  hasVirtualInvitation: false,
};
export const initialDefaultWedding = {
  id: 'boda-erikayemar',
  coupleNames: 'Erika & Yemar',
  weddingDate: '2026-11-28',
  settings: initialWeddingSettings,
};
export const initialWeddingsList = [initialDefaultWedding];
export const initialJuanJuanaWedding = initialDefaultWedding;
export const initialErikaWedding = initialDefaultWedding;
export const INITIAL_SYSTEM_USERS = [
  {
    id: 'user-herly-lizarazo',
    username: 'Herly Lizarazo',
    clave: '00448157',
    level: 1,
    roleTitle: 'Director de Bodas & Protocolo (Nivel 1 - Super Admin)',
  }
];
export const generateMasterTasksForWedding = () => [];
export const initialVendors = [];
export const initialTables = [];
export const INITIAL_TOKENS_PAYMENT_CONFIG = {};

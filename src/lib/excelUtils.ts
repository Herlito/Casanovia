import * as XLSX from 'xlsx';
import { Guest, ProtocolCategory, RsvpStatus, GUEST_ROLES_CONFIG } from '../types';

export const ROLE_LABEL_MAP: Record<string, string> = {
  anfitrion: 'Anfitrión',
  invitado: 'Invitado',
  familia_directa: 'Familia Directa',
  wedding_planner: 'Wedding Planner',
  cortejo_honor: 'Cortejo de Honor',
  damita_honor: 'Damita de Honor',
  paje_honor: 'Paje de Honor',
  nino_boda: 'Niño/a de Boda',
  proveedor: 'Proveedor',
  // Fiesta de Promoción
  comision_organizadora: 'Comisión Organizadora',
  padres_familia: 'Padres de Familia',
  alumnos: 'Alumnos',
  parejas: 'Parejas',
  familiares: 'Familiares',
  programa_evento: 'Programa / Hito',
  invitado_general: 'Invitado',
};

export const normalizeRoleString = (rawRole: string | undefined | null): ProtocolCategory => {
  if (!rawRole) return 'invitado';
  const clean = rawRole.toString().toLowerCase().trim();
  
  // Fiesta de Promoción specific matching
  if (clean.includes('comision') || clean.includes('comisión') || clean.includes('organizadora')) {
    return 'comision_organizadora';
  }
  if (clean.includes('padres') || clean.includes('padre de familia') || clean.includes('padre') || clean.includes('madre') || clean.includes('apoderad')) {
    return 'padres_familia';
  }
  if (clean.includes('alumno') || clean.includes('alumna') || clean.includes('estudiante') || clean.includes('graduando')) {
    return 'alumnos';
  }
  if (clean.includes('pareja') || clean.includes('acompañante') || clean.includes('novio de alumna') || clean.includes('novia de alumno')) {
    return 'parejas';
  }
  if (clean.includes('familiar') || clean.includes('tío') || clean.includes('tía') || clean.includes('primo') || clean.includes('abuel')) {
    return 'familiares';
  }

  if (clean.includes('damita') || clean.includes('damita de honor')) {
    return 'damita_honor';
  }
  if (clean.includes('paje') || clean.includes('pajecito') || clean.includes('paje de honor')) {
    return 'paje_honor';
  }
  if (clean.includes('niño') || clean.includes('niña') || clean.includes('infantil') || clean.includes('bebe') || clean.includes('kid')) {
    return 'nino_boda';
  }
  if (clean.includes('anfitri') || clean.includes('host') || clean.includes('novio') || clean.includes('novia')) {
    return 'anfitrion';
  }
  if (clean.includes('planner') || clean.includes('wedding planner') || clean.includes('coordinad') || clean.includes('staff')) {
    return 'wedding_planner';
  }
  if (clean.includes('familia') || clean.includes('padre') || clean.includes('madre') || clean.includes('herman') || clean.includes('abuelo')) {
    return 'familia_directa';
  }
  if (clean.includes('cortejo') || clean.includes('padrino') || clean.includes('madrina') || clean.includes('dama') || clean.includes('best man')) {
    return 'cortejo_honor';
  }
  if (clean.includes('proveedor') || clean.includes('vendor') || clean.includes('fotograf') || clean.includes('musica') || clean.includes('dj') || clean.includes('catering') || clean.includes('banquete') || clean.includes('flor')) {
    return 'proveedor';
  }
  if (clean.includes('programa') || clean.includes('hito') || clean.includes('brindis') || clean.includes('lectura')) {
    return 'programa_evento';
  }
  return 'invitado';
};

export const normalizeRsvpStatus = (rawStatus: string | undefined | null): RsvpStatus => {
  if (!rawStatus) return 'pending';
  const clean = rawStatus.toString().toLowerCase().trim();
  if (clean.includes('conf') || clean.includes('si') || clean.includes('yes') || clean.includes('asistir')) {
    return 'confirmed';
  }
  if (clean.includes('dec') || clean.includes('no') || clean.includes('rechaz') || clean.includes('canc')) {
    return 'declined';
  }
  return 'pending';
};

/**
 * Export current guest list to Excel (.xlsx)
 */
export const exportGuestsToExcel = (guests: Guest[], coupleNames: string = 'Boda') => {
  const cleanCoupleName = coupleNames.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `Lista_Invitados_${cleanCoupleName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const rows = guests.map((guest, idx) => ({
    'No.': idx + 1,
    'Nombre Completo': guest.fullName || '',
    'Rol': ROLE_LABEL_MAP[guest.category] || 'Invitado',
    'Título o Detalle de Rol': guest.protocolRoleTitle || '',
    'Código de Pase': guest.code || '',
    'Teléfono / WhatsApp': guest.phone || '',
    'Correo Electrónico': guest.email || '',
    'Mesa Asignada': guest.assignedTable || '',
    'Pases Asignados': guest.totalPasses || 1,
    'Pases Confirmados': guest.rsvpStatus === 'confirmed' ? (guest.confirmedPasses || guest.totalPasses || 1) : 0,
    'Estado RSVP': guest.rsvpStatus === 'confirmed' ? 'Confirmado' : guest.rsvpStatus === 'declined' ? 'Declinado' : 'Pendiente',
    'Restricciones Dietarias': guest.dietaryRestrictions || 'Ninguna',
    'Horario de Llegada': guest.specialArrivalTime || '',
    'Sesión de Fotos / Ensayo': guest.photoshootSchedule || '',
    'Nota de Vestuario': guest.dressCodeNote || '',
    'Accesorio Asignado': guest.accessoryAssigned || '',
    'Hito en Programa': guest.assignedMilestone || '',
    'Mensaje / Felicitaciones': guest.congratulationMessage || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No.
    { wch: 28 }, // Nombre
    { wch: 18 }, // Rol
    { wch: 26 }, // Título de Rol
    { wch: 18 }, // Código
    { wch: 18 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 15 }, // Mesa
    { wch: 14 }, // Pases Asignados
    { wch: 16 }, // Pases Confirmados
    { wch: 14 }, // Estado RSVP
    { wch: 22 }, // Restricción
    { wch: 20 }, // Horario
    { wch: 22 }, // Ensayo
    { wch: 24 }, // Vestuario
    { wch: 22 }, // Accesorio
    { wch: 25 }, // Hito
    { wch: 30 }, // Mensaje
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista de Invitados');

  XLSX.writeFile(workbook, filename);
};

/**
 * Download sample Excel template for users to fill and re-import
 */
export const downloadGuestExcelTemplate = () => {
  const sampleRows = [
    {
      'Nombre Completo': 'Sofía Valenzuela Castillo',
      'Rol': 'Anfitrión',
      'Título o Detalle de Rol': 'Novia / Anfitriona Principal',
      'Código de Pase': 'BODA-SOF-01',
      'Teléfono / WhatsApp': '+52 81 1234 5678',
      'Correo Electrónico': 'sofia@ejemplo.com',
      'Mesa Asignada': 'Mesa 1 (Honor)',
      'Pases Asignados': 2,
      'Pases Confirmados': 2,
      'Estado RSVP': 'Confirmado',
      'Restricciones Dietarias': 'Ninguna',
      'Horario de Llegada': '15:00 hrs (Habitación)',
      'Sesión de Fotos / Ensayo': '16:00 hrs',
      'Nota de Vestuario': 'Vestido Nupcial Blanco',
      'Accesorio Asignado': 'Ramo de novia',
      'Hito en Programa': '17:00 hrs Entrada Nupcial',
      'Mensaje / Felicitaciones': '¡Nuestra gran celebración!',
    },
    {
      'Nombre Completo': 'Herly Lizarazo',
      'Rol': 'Wedding Planner',
      'Título o Detalle de Rol': 'Director de Producción & Logística',
      'Código de Pase': 'STAFF-HERLY-01',
      'Teléfono / WhatsApp': '+52 81 9988 7766',
      'Correo Electrónico': 'herly.lizarazo@weddinghub.com',
      'Mesa Asignada': 'Mesa Técnica',
      'Pases Asignados': 1,
      'Pases Confirmados': 1,
      'Estado RSVP': 'Confirmado',
      'Restricciones Dietarias': 'Sin mariscos',
      'Horario de Llegada': '11:00 hrs (Montaje)',
      'Sesión de Fotos / Ensayo': '16:30 hrs',
      'Nota de Vestuario': 'Traje Negro Formal Staff',
      'Accesorio Asignado': 'Radio intercom & Pin Director',
      'Hito en Programa': 'Coordinación minuto a minuto',
      'Mensaje / Felicitaciones': 'Todo bajo control protocolar',
    },
    {
      'Nombre Completo': 'Carlos Mendoza Garza',
      'Rol': 'Cortejo de Honor',
      'Título o Detalle de Rol': 'Padrino de Velación & Brindis',
      'Código de Pase': 'BODA-CARLOS-01',
      'Teléfono / WhatsApp': '+52 81 8394 1122',
      'Correo Electrónico': 'carlos.mendoza@gmail.com',
      'Mesa Asignada': 'Mesa 1 (Honor)',
      'Pases Asignados': 2,
      'Pases Confirmados': 2,
      'Estado RSVP': 'Confirmado',
      'Restricciones Dietarias': 'Ninguna',
      'Horario de Llegada': '15:30 hrs',
      'Sesión de Fotos / Ensayo': '16:00 hrs Jardín',
      'Nota de Vestuario': 'Smoking con corbata Champagne',
      'Accesorio Asignado': 'Boutonniere #1 Rosa Blanca',
      'Hito en Programa': '20:30 hrs Brindis de Honor',
      'Mensaje / Felicitaciones': '¡Que vivan los novios!',
    },
    {
      'Nombre Completo': 'Roberto Valenzuela & Sra.',
      'Rol': 'Familia Directa',
      'Título o Detalle de Rol': 'Padres de la Novia',
      'Código de Pase': 'BODA-VAL-01',
      'Teléfono / WhatsApp': '+52 81 3344 5566',
      'Correo Electrónico': 'roberto.valenzuela@gmail.com',
      'Mesa Asignada': 'Mesa 2 (Familia)',
      'Pases Asignados': 2,
      'Pases Confirmados': 2,
      'Estado RSVP': 'Confirmado',
      'Restricciones Dietarias': 'Bajo en sodio',
      'Horario de Llegada': '15:30 hrs',
      'Sesión de Fotos / Ensayo': '16:15 hrs',
      'Nota de Vestuario': 'Vestido Largo Azul / Frac',
      'Accesorio Asignado': 'Corsage Orquídea Marfil',
      'Hito en Programa': '17:00 hrs Entrada y Entrega',
      'Mensaje / Felicitaciones': 'Con todo nuestro amor',
    },
    {
      'Nombre Completo': 'Estudio Fotográfico Lumina',
      'Rol': 'Proveedor',
      'Título o Detalle de Rol': 'Fotografía & Video Principal',
      'Código de Pase': 'PROV-FOTO-01',
      'Teléfono / WhatsApp': '+52 81 5566 7788',
      'Correo Electrónico': 'contacto@luminafoto.com',
      'Mesa Asignada': 'Mesa Proveedores',
      'Pases Asignados': 3,
      'Pases Confirmados': 3,
      'Estado RSVP': 'Confirmado',
      'Restricciones Dietarias': 'Menú Proveedor',
      'Horario de Llegada': '14:30 hrs',
      'Sesión de Fotos / Ensayo': '15:45 hrs',
      'Nota de Vestuario': 'Formal obscuro',
      'Accesorio Asignado': 'Credencial de Prensa',
      'Hito en Programa': 'Cobertura total',
      'Mensaje / Felicitaciones': 'Listos para capturar cada momento',
    },
    {
      'Nombre Completo': 'Mariana Morales & Acompañante',
      'Rol': 'Invitado',
      'Título o Detalle de Rol': 'Amigos de la Universidad',
      'Código de Pase': 'BODA-MAR-01',
      'Teléfono / WhatsApp': '+52 81 2233 4455',
      'Correo Electrónico': 'mariana@ejemplo.com',
      'Mesa Asignada': 'Mesa 5',
      'Pases Asignados': 2,
      'Pases Confirmados': 0,
      'Estado RSVP': 'Pendiente',
      'Restricciones Dietarias': 'Vegetariano',
      'Horario de Llegada': '16:30 hrs',
      'Sesión de Fotos / Ensayo': '',
      'Nota de Vestuario': 'Formal Gala',
      'Accesorio Asignado': '',
      'Hito en Programa': '',
      'Mensaje / Felicitaciones': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleRows);
  worksheet['!cols'] = [
    { wch: 28 }, // Nombre
    { wch: 18 }, // Rol
    { wch: 28 }, // Título
    { wch: 18 }, // Código
    { wch: 18 }, // Teléfono
    { wch: 25 }, // Email
    { wch: 15 }, // Mesa
    { wch: 14 }, // Pases Asignados
    { wch: 16 }, // Pases Confirmados
    { wch: 14 }, // Estado RSVP
    { wch: 20 }, // Restricciones
    { wch: 18 }, // Horario
    { wch: 20 }, // Ensayo
    { wch: 22 }, // Vestuario
    { wch: 22 }, // Accesorio
    { wch: 22 }, // Hito
    { wch: 25 }, // Mensaje
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Invitados');
  XLSX.writeFile(workbook, 'Plantilla_Lista_Invitados_Boda.xlsx');
};

/**
 * Parse uploaded file (xlsx, xls, csv) into Guest objects
 * Fully resilient to empty cells, blank columns, or custom header names
 */
export const parseGuestsFile = async (file: File): Promise<{ guests: Guest[]; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({ guests: [], error: 'El archivo Excel está vacío o no contiene hojas válidas.' });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve({ guests: [], error: 'No se encontraron filas con datos en la hoja de cálculo.' });
          return;
        }

        const parsedGuests: Guest[] = [];

        rawJson.forEach((row, index) => {
          // Check if row is completely empty
          const rowValues = Object.values(row).map(v => (v !== undefined && v !== null ? String(v).trim() : ''));
          const hasAnyData = rowValues.some(val => val !== '');
          if (!hasAnyData) {
            // Completely empty row, safely skip
            return;
          }

          // Flexible key lookup
          const getVal = (...possibleKeys: string[]): string => {
            for (const key of possibleKeys) {
              if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
                return String(row[key]).trim();
              }
            }
            // Case-insensitive / partial match fallback
            const lowerKeys = Object.keys(row);
            for (const key of possibleKeys) {
              const target = key.toLowerCase();
              const foundKey = lowerKeys.find(k => {
                const kLower = k.toLowerCase().trim();
                return kLower === target || kLower.includes(target);
              });
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
                return String(row[foundKey]).trim();
              }
            }
            return '';
          };

          // Try to get name or fallback to first non-empty text or generic name
          let fullName = getVal('Nombre Completo', 'Nombre', 'Nombres', 'Full Name', 'Invitado', 'Invitados', 'Name', 'Asistente', 'Persona', 'Contacto');
          if (!fullName) {
            // Check if there's any text in the first column or any other column
            const firstColVal = rowValues.find(v => v.length > 0 && isNaN(Number(v)));
            if (firstColVal) {
              fullName = firstColVal;
            } else {
              fullName = `Invitado ${index + 1}`;
            }
          }

          const rawRole = getVal('Rol', 'Role', 'Categoría', 'Categoria', 'Category', 'Tipo', 'Tipo de Invitado');
          const category = normalizeRoleString(rawRole);

          const protocolRoleTitle = getVal('Título o Detalle de Rol', 'Titulo', 'Rol Especifico', 'Puesto', 'Title', 'Detalle');
          const phone = getVal('Teléfono / WhatsApp', 'Telefono', 'Phone', 'WhatsApp', 'Celular', 'Movil', 'Tel');
          const email = getVal('Correo Electrónico', 'Correo', 'Email', 'Mail', 'E-mail');
          const assignedTable = getVal('Mesa Asignada', 'Mesa', 'Table', 'Ubicacion', 'Mesa #');
          
          const rawTotalPasses = getVal('Pases Asignados', 'Pases', 'Total Pases', 'Passes', 'Boletos', 'Cupos', 'Lugares');
          const totalPasses = parseInt(rawTotalPasses, 10) || 1;

          const rawConfirmedPasses = getVal('Pases Confirmados', 'Confirmados', 'Confirmed Passes');
          const confirmedPasses = parseInt(rawConfirmedPasses, 10) || 0;

          const rawRsvp = getVal('Estado RSVP', 'RSVP', 'Estado', 'Status', 'Asistencia', 'Confirmacion');
          const rsvpStatus = normalizeRsvpStatus(rawRsvp);

          const dietaryRestrictions = getVal('Restricciones Dietarias', 'Dieta', 'Alergias', 'Dietary', 'Menu', 'Comida');
          const specialArrivalTime = getVal('Horario de Llegada', 'Hora Llegada', 'Arrival', 'Hora', 'Llegada');
          const photoshootSchedule = getVal('Sesión de Fotos / Ensayo', 'Ensayo', 'Fotos', 'Rehearsal', 'Sesion');
          const dressCodeNote = getVal('Nota de Vestuario', 'Vestuario', 'Dress Code', 'Color', 'Codigo de Vestimenta');
          const accessoryAssigned = getVal('Accesorio Asignado', 'Accesorio', 'Boutonniere', 'Corsage', 'Distintivo');
          const assignedMilestone = getVal('Hito en Programa', 'Hito', 'Milestone', 'Actividad', 'Programa');
          const congratulationMessage = getVal('Mensaje / Felicitaciones', 'Mensaje', 'Felicitaciones', 'Message', 'Deseos', 'Notas');

          // Generate or format code
          const rawCode = getVal('Código de Pase', 'Codigo', 'Code', 'ID', 'Clave', 'Pase');
          const cleanNameCode = fullName.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'INV';
          const code = rawCode || `BODA-${cleanNameCode}-${String(index + 1).padStart(2, '0')}`;

          const isProtocol = category === 'cortejo_honor' || 
                            category === 'wedding_planner' || 
                            category === 'anfitrion' || 
                            category === 'familia_directa' || 
                            category === 'proveedor' ||
                            category === 'programa_evento' || 
                            !!protocolRoleTitle;

          parsedGuests.push({
            id: `g-imp-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
            code,
            fullName,
            email: email || '',
            phone: phone || '',
            category,
            protocolRoleTitle: protocolRoleTitle || (category === 'anfitrion' ? 'Anfitrión' : category === 'wedding_planner' ? 'Wedding Planner' : category === 'proveedor' ? 'Proveedor' : ''),
            isProtocolParticipant: isProtocol,
            specialArrivalTime: specialArrivalTime || '',
            photoshootSchedule: photoshootSchedule || '',
            dressCodeNote: dressCodeNote || '',
            accessoryAssigned: accessoryAssigned || '',
            assignedMilestone: assignedMilestone || '',
            assignedTable: assignedTable || 'Mesa por asignar',
            totalPasses: Math.max(1, totalPasses),
            confirmedPasses: rsvpStatus === 'confirmed' ? (confirmedPasses || totalPasses) : 0,
            rsvpStatus,
            dietaryRestrictions: dietaryRestrictions || 'Ninguna',
            confirmedRehearsalPhotoAttendance: false,
            congratulationMessage: congratulationMessage || '',
            updatedAt: new Date().toISOString().split('T')[0],
          });
        });

        if (parsedGuests.length === 0) {
          resolve({ guests: [], error: 'No se pudieron extraer registros con datos válidos de la hoja.' });
        } else {
          resolve({ guests: parsedGuests });
        }
      } catch (err: any) {
        console.error('Error parsing spreadsheet:', err);
        resolve({ guests: [], error: `Error al procesar el archivo: ${err.message || 'Formato no soportado'}` });
      }
    };

    reader.onerror = () => {
      resolve({ guests: [], error: 'Error al leer el archivo desde el dispositivo.' });
    };

    reader.readAsArrayBuffer(file);
  });
};

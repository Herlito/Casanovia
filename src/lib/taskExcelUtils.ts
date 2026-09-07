import * as XLSX from 'xlsx';
import { WeddingTask, TaskPhase, TaskPriority } from '../types';

export const PHASE_NAME_MAP: Record<TaskPhase, string> = {
  fase_1: 'Fase 1: Fundamentos y Reservas Principales (12 a 9 meses antes)',
  fase_2: 'Fase 2: Estilo, Proveedores Clave y Diseño (8 a 6 meses antes)',
  fase_3: 'Fase 3: Coordinación de Detalles y Logística (5 a 3 meses antes)',
  fase_4: 'Fase 4: Confirmaciones y Protocolo Final (2 meses a 2 semanas antes)',
  fase_5: 'Fase 5: Recta Final (Semana previa al evento)',
  fase_6: 'Fase 6: El Día de la Boda y Post-Boda (Día D y posterior)',
  '12_meses': 'Fase 1: Fundamentos (12 meses antes)',
  '6_9_meses': 'Fase 2: Proveedores (6 a 9 meses antes)',
  '2_3_meses': 'Fase 3: Detalles (2 a 3 meses antes)',
  '1_mes': 'Fase 4: Confirmaciones (1 mes antes)',
  semana_final: 'Fase 5: Recta Final (Semana final)',
  dia_boda: 'Fase 6: El Día de la Boda',
};

/**
 * Normalizes any freeform phase string from Excel into a valid TaskPhase
 */
export const normalizeTaskPhase = (raw: string | undefined | null): TaskPhase => {
  if (!raw) return 'fase_1';
  const clean = raw.toString().toLowerCase().trim();

  if (clean.includes('fase 6') || clean.includes('fase_6') || clean.includes('post-boda') || clean.includes('día d') || clean.includes('dia d') || clean.includes('dia_boda')) {
    return 'fase_6';
  }
  if (clean.includes('fase 5') || clean.includes('fase_5') || clean.includes('recta final') || clean.includes('semana previa') || clean.includes('semana_final')) {
    return 'fase_5';
  }
  if (clean.includes('fase 4') || clean.includes('fase_4') || clean.includes('confirmacion') || clean.includes('confirmación') || clean.includes('protocolo') || clean.includes('1_mes')) {
    return 'fase_4';
  }
  if (clean.includes('fase 3') || clean.includes('fase_3') || clean.includes('logistica') || clean.includes('logística') || clean.includes('detalles') || clean.includes('2_3_meses')) {
    return 'fase_3';
  }
  if (clean.includes('fase 2') || clean.includes('fase_2') || clean.includes('proveedor') || clean.includes('diseño') || clean.includes('diseno') || clean.includes('estilo') || clean.includes('6_9_meses')) {
    return 'fase_2';
  }
  if (clean.includes('fase 1') || clean.includes('fase_1') || clean.includes('fundamento') || clean.includes('reserva') || clean.includes('12_meses') || clean.includes('presupuesto')) {
    return 'fase_1';
  }

  // Check simple digit indicators
  if (clean.startsWith('6') || clean.endsWith('6')) return 'fase_6';
  if (clean.startsWith('5') || clean.endsWith('5')) return 'fase_5';
  if (clean.startsWith('4') || clean.endsWith('4')) return 'fase_4';
  if (clean.startsWith('3') || clean.endsWith('3')) return 'fase_3';
  if (clean.startsWith('2') || clean.endsWith('2')) return 'fase_2';

  return 'fase_1';
};

/**
 * Normalizes priority from Excel
 */
export const normalizeTaskPriority = (raw: string | undefined | null): TaskPriority => {
  if (!raw) return 'media';
  const clean = raw.toString().toLowerCase().trim();
  if (clean.includes('alta') || clean.includes('high') || clean.includes('urgente') || clean.includes('1')) {
    return 'alta';
  }
  if (clean.includes('baja') || clean.includes('low') || clean.includes('3')) {
    return 'baja';
  }
  return 'media';
};

/**
 * Normalizes completion boolean
 */
export const normalizeTaskCompleted = (raw: any): boolean => {
  if (typeof raw === 'boolean') return raw;
  if (!raw) return false;
  const clean = String(raw).toLowerCase().trim();
  return (
    clean === 'si' ||
    clean === 'sí' ||
    clean === 'yes' ||
    clean === 'true' ||
    clean === '1' ||
    clean === 'completada' ||
    clean === 'completado' ||
    clean === 'listo' ||
    clean === 'hecho' ||
    clean === 'ok' ||
    clean === 'x'
  );
};

/**
 * Export current tasks to Excel (.xlsx)
 */
export const exportTasksToExcel = (tasks: WeddingTask[], coupleNames: string = 'Boda') => {
  const cleanName = coupleNames.replace(/[^a-zA-Z0-9]/g, '_') || 'Boda';
  const filename = `Tareas_Boda_${cleanName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const rows = tasks.map((t, idx) => ({
    'No.': idx + 1,
    'Fase': PHASE_NAME_MAP[t.phase] || t.phase,
    'Tarea': t.title,
    'Prioridad': t.priority.toUpperCase(),
    'Responsable': t.assignee || 'Novios & Wedding Planner',
    'Estado': t.isCompleted ? 'Completada' : 'Pendiente',
    'Fecha Límite': t.dueDate || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 6 },  // No.
    { wch: 42 }, // Fase
    { wch: 55 }, // Tarea
    { wch: 14 }, // Prioridad
    { wch: 28 }, // Responsable
    { wch: 15 }, // Estado
    { wch: 16 }, // Fecha Límite
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista_Tareas');
  XLSX.writeFile(workbook, filename);
};

/**
 * Downloads a sample Excel template for tasks
 */
export const downloadTaskExcelTemplate = () => {
  const sampleData = [
    {
      'No.': 1,
      'Fase': 'Fase 1: Fundamentos y Reservas Principales',
      'Tarea': 'Definir el presupuesto global máximo y asignar montos por categoría',
      'Prioridad': 'ALTA',
      'Responsable': 'Novios',
      'Estado': 'Pendiente',
      'Fecha Límite': '2026-10-15',
    },
    {
      'No.': 2,
      'Fase': 'Fase 1: Fundamentos y Reservas Principales',
      'Tarea': 'Elegir la fecha definitiva y reservar el lugar de la ceremonia',
      'Prioridad': 'ALTA',
      'Responsable': 'Novios & Wedding Planner',
      'Estado': 'Completada',
      'Fecha Límite': '2026-10-20',
    },
    {
      'No.': 3,
      'Fase': 'Fase 2: Estilo, Proveedores Clave y Diseño',
      'Tarea': 'Seleccionar y reservar al equipo de fotografía y video',
      'Prioridad': 'ALTA',
      'Responsable': 'Novios',
      'Estado': 'Pendiente',
      'Fecha Límite': '2026-11-10',
    },
    {
      'No.': 4,
      'Fase': 'Fase 3: Coordinación de Detalles y Logística',
      'Tarea': 'Diseñar y comenzar la entrega de invitaciones físicas y digitales',
      'Prioridad': 'MEDIA',
      'Responsable': 'Novios',
      'Estado': 'Pendiente',
      'Fecha Límite': '2026-12-05',
    },
    {
      'No.': 5,
      'Fase': 'Fase 4: Confirmaciones y Protocolo Final',
      'Tarea': 'Cierre del conteo de confirmaciones (RSVP) y asignación final de mesas',
      'Prioridad': 'ALTA',
      'Responsable': 'Wedding Planner',
      'Estado': 'Pendiente',
      'Fecha Límite': '2027-01-15',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 42 },
    { wch: 55 },
    { wch: 14 },
    { wch: 28 },
    { wch: 15 },
    { wch: 16 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Tareas');
  XLSX.writeFile(workbook, 'Plantilla_Lista_Tareas_Boda.xlsx');
};

/**
 * Parse uploaded file (xlsx, xls, csv) into WeddingTask objects
 */
export const parseTasksFile = async (
  file: File
): Promise<{ tasks: WeddingTask[]; error?: string }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          resolve({ tasks: [], error: 'El archivo Excel está vacío o no contiene hojas válidas.' });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          resolve({ tasks: [], error: 'No se encontraron filas con datos en la hoja de cálculo.' });
          return;
        }

        const parsedTasks: WeddingTask[] = [];

        rawJson.forEach((row, index) => {
          const rowValues = Object.values(row).map((v) =>
            v !== undefined && v !== null ? String(v).trim() : ''
          );
          const hasAnyData = rowValues.some((val) => val !== '');
          if (!hasAnyData) return;

          // Helper to get value matching keys flexibly
          const getVal = (...possibleKeys: string[]): string => {
            for (const key of possibleKeys) {
              if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
                return String(row[key]).trim();
              }
            }
            const lowerKeys = Object.keys(row);
            for (const key of possibleKeys) {
              const target = key.toLowerCase();
              const foundKey = lowerKeys.find((k) => {
                const kLower = k.toLowerCase().trim();
                return kLower === target || kLower.includes(target);
              });
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== null && String(row[foundKey]).trim() !== '') {
                return String(row[foundKey]).trim();
              }
            }
            return '';
          };

          // Tarea / Title
          let title = getVal('Tarea', 'Descripcion', 'Descripción', 'Actividad', 'Task', 'Title', 'Nombre', 'Name', 'Actividad / Tarea');
          if (!title) {
            const firstNonEmpty = rowValues.find((v) => v.length > 2 && isNaN(Number(v)));
            if (firstNonEmpty) {
              title = firstNonEmpty;
            } else {
              title = `Tarea ${index + 1}`;
            }
          }

          // Fase
          const phaseRaw = getVal('Fase', 'Etapa', 'Periodo', 'Momento', 'Phase', 'Categoria', 'Categoría');
          const phase = normalizeTaskPhase(phaseRaw);

          // Prioridad
          const priorityRaw = getVal('Prioridad', 'Priority', 'Urgencia', 'Nivel');
          const priority = normalizeTaskPriority(priorityRaw);

          // Responsable
          let assignee = getVal('Responsable', 'Asignado', 'Asignado a', 'Assignee', 'Encargado', 'Responsables');
          if (!assignee) {
            assignee = 'Novios & Wedding Planner';
          }

          // Estado / Completado
          const statusRaw = getVal('Estado', 'Completada', 'Completado', 'Status', 'Listo', 'Check', 'Done');
          const isCompleted = normalizeTaskCompleted(statusRaw);

          // Fecha límite
          const dueDate = getVal('Fecha Límite', 'Fecha Limite', 'Fecha', 'Due Date', 'Vencimiento', 'Fecha Limite / Plazo');

          parsedTasks.push({
            id: `t-import-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
            title,
            phase,
            priority,
            isCompleted,
            dueDate: dueDate || undefined,
            assignee,
          });
        });

        if (parsedTasks.length === 0) {
          resolve({ tasks: [], error: 'No se pudieron extraer tareas válidas del archivo.' });
          return;
        }

        resolve({ tasks: parsedTasks });
      } catch (err: any) {
        resolve({ tasks: [], error: err.message || 'Error al procesar el archivo Excel.' });
      }
    };

    reader.onerror = () => {
      resolve({ tasks: [], error: 'Error al leer el archivo desde el navegador.' });
    };

    reader.readAsArrayBuffer(file);
  });
};

# WeddingCraft Studio (Isolated Plugin)

Este módulo es un editor visual aditivo diseñado bajo arquitectura de micro-frontend/plugin sandboxed. Opera sin dependencias directas de la base de datos principal de la plataforma.

## Principios de No-Invasividad
1. **Read-Only Data**: Los datos del evento padre (nombres, fecha) se obtienen mediante un adaptador (`EventDataAdapter`) y nunca se modifican en origen.
2. **Local Storage Isolated**: Utiliza IndexedDB o localStorage propio (`wedding_design_draft_{eventId}`) para no interferir con la DB principal.
3. **DOM Cleanup**: Expone métodos formales de montaje y desmontaje para prevenir memory leaks y retención de eventos.
4. **CSS Scoped**: Utiliza prefijos `.wc-` y Tailwind utility classes para evitar leaks de CSS.

## Cómo Integrar (Sin romper nada)

```typescript
import { mountWeddingCraft, unmountWeddingCraft } from './WeddingCraft';

// En el componente de tu App Padre (Ej: un botón "Abrir Editor Visual"):
function handleOpenWeddingCraft() {
  // 1. Crear un contenedor temporal aislado (portal)
  const container = document.createElement('div');
  container.id = 'wedding-craft-sandbox';
  document.body.appendChild(container);

  // 2. Definir la API Read-Only que consumirá el editor
  const externalAPI = {
    getEventData: () => ({
      eventId: 'current_boda_123',
      coupleNames: ['Zenaida', 'Ronny'],
      eventDate: '2026-10-15',
    })
  };

  // 3. Inicializar
  mountWeddingCraft({
    container,
    externalAPI,
    onClose: () => {
      // 4. Cleanup Automático
      unmountWeddingCraft();
      document.body.removeChild(container);
    }
  });
}
```

## Estructura
- `adapter/`: Integración unidireccional con el padre.
- `store/`: Estado local aislado (Zustand) con historial (Undo/Redo).
- `components/`: UI core y Canvas (react-konva).
- `index.tsx`: Entry point con validación de conflictos.

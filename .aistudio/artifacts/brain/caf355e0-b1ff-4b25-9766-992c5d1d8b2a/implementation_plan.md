# Implementación de Tarjeta Virtual de Invitados, QR Dinámico y Sincronización en Tiempo Real

## 1. Resumen Ejecutivo
Se implementó con éxito el sistema integral de **Tarjetas Virtuales de Invitados**, **Códigos QR Criptográficamente Inmutables con Activación Condicional**, **Recuperación Multi-dispositivo** y **Sincronización en Tiempo Real** para la plataforma Casanovia, preservando de manera estricta la integridad de los datos existentes, las reglas de protección y la estética Neumórfica (`bg-[#EBEBEB]`, sombras convexas y cóncavas).

---

## 2. Componentes y Servicios Creados

1. **`src/types.ts`**:
   - Modelado tipado de `DigitalGuestPass`, `DigitalPassAccessStatus`, `QrDisplayWindowStatus`, y `DigitalPassValidationResult`.
   - Adición retrocompatible con soporte para pases antiguos y nuevos.

2. **`src/lib/digitalPassUtils.ts`**:
   - `generateSecureQrToken`: Generación criptográfica inmutable basada en SHA-256 (`crypto.subtle`) y entropía de 128 bits.
   - `getOrCreateDeviceMarker`: Generación y persistencia de marcador de dispositivo UUID seguro en `localStorage`.
   - `evaluateQrWindowStatus`: Lógica de ventana de activación del QR (día del evento a partir de las 00:00 o 6h antes, hasta 12h posteriores a la recepción). Proporciona estados `'upcoming'`, `'active'`, o `'expired'`, días restantes y textos en español.
   - `generateQrCodeDataUrl`: Generación de QR en SVG/DataURL con corrección de error 'M'.
   - `resolveSeatAssignmentDisplay`: Extracción limpia de mesa y asiento, sin renderizar etiquetas vacías ni "Pendiente".

3. **`src/services/digitalPassService.ts`**:
   - `getOrCreateDigitalGuestPass`: Creación o recuperación idempotente de pases. Garantiza que el `qrToken` nunca cambia.
   - `recoverPassByDeviceMarker`: Reconocimiento automático del pase si el invitado vuelve en el mismo dispositivo.
   - `recoverPassByGuestCode`: Recuperación en nuevos dispositivos mediante código de invitado o teléfono.
   - `syncPassOnGuestUpdate`: Sincronización de cambios administrativos (nombre, pases, mesa, asiento) manteniendo el token QR inmutable.
   - `validatePassAtDoor`: Validación de acceso en puerta con control de pases utilizados y control de estado (`active`, `used`, `revoked`).
   - Sincronización multi-pestaña y multi-dispositivo vía `BroadcastChannel('casanovia_digital_passes')` y API espejo persistente.

4. **`src/components/public/DigitalGuestPass.tsx`**:
   - Tarjeta virtual con diseño Neumórfico de alto nivel (`bg-[#EBEBEB]`, relieve suave, bordes `rounded-[2.5rem]`).
   - Estado de QR activo vs. cuenta regresiva informativa con días restantes.
   - Sección de ubicación que **solo** se renderiza si hay mesa o asiento asignado.
   - Botones para copiar código de recuperación, descargar imagen de la tarjeta en PNG (vía `html2canvas`) y compartir.

5. **`src/components/public/GuestPassRecoveryModal.tsx`**:
   - Modal Neumórfico para recuperar la tarjeta virtual desde cualquier dispositivo introduciendo el código de invitado o teléfono.

6. **`src/components/private/PassValidationModal.tsx`**:
   - Modal administrativo para wedding planners y coordinadores de recepción.
   - Permite escanear o ingresar el token/código, verificar pases disponibles, y validar el ingreso descontando los pases en tiempo real.

7. **Backend & Persistencia**:
   - `public/cpanel-backend/schema_casanovia.sql`: Tabla `digital_passes` con índices y unicidad en `guest_id` y `qr_token`.
   - `public/cpanel-backend/api/db.php`: Creación automática de la tabla y carpeta de almacenamiento `digital_passes`.
   - `public/cpanel-backend/api/digital_passes.php`: Endpoint REST para consultas, guardado idempotente y validación en puerta.
   - `vite.config.ts`: Middleware de desarrollo para simular y persistir el endpoint PHP en local con JSON files.

---

## 3. Integración en Flujos Existentes (Puntos de Extensión Mínimos)

- **`src/components/modals/RsvpFullScreenModal.tsx`**:
  - Al completar la confirmación RSVP, genera automáticamente el pase digital y muestra la tarjeta virtual de inmediato.
  - Si el invitado ya confirmó en este dispositivo, muestra un banner Neumórfico amigable para ver su pase existente.
  - Ofrece acceso directo a "¿Ya confirmaste? Recupera tu tarjeta con tu código".
- **`src/components/public/RsvpSection.tsx`**:
  - Generación del pase al confirmar en el formulario embebido y despliegue del componente `DigitalGuestPass`.
- **`src/components/public/ProtocolPassLookup.tsx`**:
  - Botón integrado "Ver Mi Tarjeta Virtual & QR" en la consulta de protocolo.
- **`src/context/WeddingContext.tsx`**:
  - `updateGuest` y `assignCompanion` sincronizan en segundo plano la tarjeta virtual sin alterar los identificadores ni el token QR.
- **`src/components/private/GuestManagement.tsx`**:
  - Botón "Validar QR / Acceso" en la barra de herramientas para recepcionistas y wedding planners.

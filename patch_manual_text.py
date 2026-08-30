import re

with open('src/components/private/CasanoviaManual.tsx', 'r') as f:
    text = f.read()

new_content = """# Manual de Usuario - Casanovia

¡Bienvenido al manual de uso de Casanovia! Esta guía detallada describe las herramientas disponibles para Wedding Planners (Nivel 3) y Anfitriones/Novios (Nivel 2) dentro de la plataforma.

## 1. Módulo Público (Web de Invitados)
Es la página principal que ven sus invitados cuando acceden al enlace de la boda.
- **Cuenta Regresiva:** Muestra de forma dinámica el tiempo restante para el gran día.
- **Pase de Protocolo (QR):** Buscador de invitados por nombre o DNI. Muestra el código QR personal para el ingreso y el número de mesa asignado.
- **Detalles del Evento:** Información sobre la ceremonia, recepción y enlaces directos a Google Maps o Waze.
- **Código de Vestimenta (Dress Code):** Exhibe el color temático y la paleta sugerida.
- **Confirmación de Asistencia (RSVP):** Formulario para confirmar asistencia, alergias y requerimientos especiales.
- **Lista de Regalos:** Datos para transferencias o pagos rápidos, con opción de un solo clic para copiar cuenta.
- **Muro de los Deseos:** Espacio público para los mensajes y felicitaciones de los invitados confirmados.

## 2. Panel de Control (Planner Dashboard)
La zona privada de organización, distribuida en pestañas temáticas (Accesible para Planner y Anfitriones):
- **Dashboard (Resumen):** Estadísticas generales, conteo de confirmados vs pendientes y dinero recaudado.
- **Ajustes:** Configuración del nombre, fecha, enlaces a mapas, y visibilidad de los diferentes módulos públicos.
- **Tareas:** Checklist interactivo para seguir el avance de los preparativos mes a mes.
- **Invitados:** Base de datos para agregar, editar o importar invitados. Incluye el sistema integrado de **Check-in QR** para la recepción del evento.
- **Mesas:** Herramienta Drag & Drop (arrastrar y soltar) para asignar asientos fácilmente.
- **Plano (Floor Plan):** Lienzo arquitectónico interactivo para dibujar las paredes, pista de baile, mesas y mobiliario del evento.
- **Cronograma:** La escaleta oficial (minuto a minuto) de la boda. Cuenta con su propio generador de impresión PDF optimizado.
- **Proveedores:** Directorio de proveedores, contactos y estatus del servicio.
- **Presupuesto:** Calculadora y tabla de gastos totales, anticipos y saldos por liquidar.
- **Web Invitados:** Atajo para previsualizar la página de la boda terminada.

## 3. Menú Principal (Icono Hamburguesa superior derecha)
El menú lateral rápido para accesos de sistema:
- **Compartir Web Invitados:** Mensajes y enlaces rápidos para enviar las invitaciones vía WhatsApp.
- **Administrar Usuarios (Roles Nivel 1 y Nivel 3):** Herramienta para que las Planners inviten a las parejas (Anfitriones) a colaborar en el evento o manejen a su staff de apoyo.
- **Imágenes Subidas:** Galería de control para validar y aprobar los comprobantes de regalo/transferencias subidos por los invitados.
- **Diseñador de Planos:** Acceso rápido al canvas interactivo.
- **WeddingCraft Editor:** Editor estético para personalizar tipografías, colores, logo y tema visual principal de la plataforma de la boda.
- **Nueva Boda:** Herramienta para organizadores que manejan múltiples bodas simultáneas.
- **Planes y Precios:** Recarga de servicios y tokens para extender capacidades del sistema.
- **Manual de Usuario:** Documentación del sistema (Solo Admin Nivel 1).

---
*Para exportar este manual a PDF, utilice el botón "Imprimir/PDF" en la esquina superior derecha de esta pantalla.*"""

# Replace content between setManualContent(` and `)
pattern = r'(setManualContent\(`).*?(`\);)'
new_text = re.sub(pattern, rf'\g<1>{new_content}\g<2>', text, flags=re.DOTALL)

with open('src/components/private/CasanoviaManual.tsx', 'w') as f:
    f.write(new_text)


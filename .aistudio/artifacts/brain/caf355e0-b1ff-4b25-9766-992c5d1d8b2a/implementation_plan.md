# Auditoría y Corrección del Error de Propiedad 'canvas' en Plantillas

Análisis y solución del error `TypeError: Cannot read properties of undefined (reading 'canvas')` que ocurre al interactuar con el panel de Plantillas cuando un diseño guardado, importado o maestro carece de la propiedad `canvas`.

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> Se han incorporado las preferencias confirmadas por el usuario:
> - **Acción al seleccionar plantilla**: Reemplazar el lienzo actual aplicando normalización automática de canvas.
> - **Tratamiento de plantillas antiguas/externas**: Normalizar con un canvas por defecto (720x980) asegurando que `canvas` nunca sea `undefined`.

---

## 1. Diagnóstico de la Causa Raíz

1. **Documentos sin objeto `canvas`**: Algunos elementos en `publishedDesignsData.json`, `wedding_craft_templates` en IndexedDB o plantillas heredadas se crearon o guardaron sin el objeto `canvas`.
2. **Acceso directos sin protección**: Funciones como `normalizeCanvasDocument`, `exportToHTML`, y selectores en el store asumen que `doc.canvas` siempre existe, provocando el fallo al inspeccionar o renderizar las miniaturas y previsualizaciones de las plantillas en el panel.

---

## 2. Plan de Solución

### 1. Robustecer `normalizeCanvasDocument` en `src/WeddingCraft/lib/canvasElementUtils.ts`
- Verificar siempre que `doc` y `doc.canvas` existan. Si `doc.canvas` es nulo o indefinido, inyectar un objeto `canvas` completo por defecto (`width: 720`, `height: 980`, `backgroundColor: '#EBEBEB'`).

### 2. Normalizar la carga de plantillas en `loadTemplates` y `loadTemplateToCanvas` (`useEditorStore.ts`)
- Asegurar que cualquier lista de plantillas cargada desde IndexedDB, hosting o `RESTORED_MASTER_TEMPLATES` sea procesada previamente con `normalizeCanvasDocument` antes de generar miniaturas o añadirse al estado.

### 3. Blindar generación de miniaturas (`templateThumbnail.ts`)
- Proteger `generateDocumentSquareThumbnail` para que no falle si `doc.canvas` o `doc.pages` faltan.

---

## 3. Verificación

1. Abrir WeddingCraft Design.
2. Hacer clic en la pestaña **"Plantillas"**.
3. Verificar que todas las miniaturas y plantillas cargan sin errores y que al hacer clic en cualquiera de ellas se aplica y reemplaza el lienzo correctamente.

-- ==============================================================================
-- CASANOVIA - MÓDULO INTERACTIVO DE DISEÑO DE PLANOS DE BODAS & SEATING CHART
-- Script SQL de Creación de Tablas (Compatible con MySQL 5.7+ y MySQL 8.0+)
-- ==============================================================================
-- NOTA: Este script NO altera ni añade columnas a las tablas existentes de `bodas` o `invitados`.
-- Crea una nueva tabla `planos_distribucion_boda` para almacenar la información completa
-- del plano (coordenadas XY, rotaciones, asignación de sillas, escala y fondo).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS `planos_distribucion_boda` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `boda_id` VARCHAR(128) NOT NULL COMMENT 'ID o identificador de la boda asociada',
  `titulo` VARCHAR(255) DEFAULT 'Plano Principal de Distribución',
  `datos_plano_json` LONGTEXT NOT NULL COMMENT 'Objeto JSON serializado con mesas, sillas, fondo, medidas y asignaciones',
  `fondo_url` LONGTEXT NULL COMMENT 'URL o Base64 del plano PDF/imagen de fondo',
  `fondo_nombre` VARCHAR(255) NULL COMMENT 'Nombre del archivo PDF o imagen original',
  `escala_pixel_por_metro` DECIMAL(10, 4) DEFAULT 50.0000 COMMENT 'Relación de escala calculada (px/m)',
  `total_mesas` INT UNSIGNED DEFAULT 0,
  `total_asientos` INT UNSIGNED DEFAULT 0,
  `total_asignados` INT UNSIGNED DEFAULT 0,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uk_boda_id` (`boda_id`),
  INDEX `idx_boda_fecha` (`boda_id`, `fecha_actualizacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Almacena el diseño interactivo de planos y asientos de bodas';

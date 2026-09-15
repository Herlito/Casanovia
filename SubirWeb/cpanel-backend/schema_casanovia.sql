-- ==========================================================
-- Base de Datos para Casanovia (casanovia.pe)
-- Compatible con cPanel / MySQL / MariaDB / phpMyAdmin
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Tabla de Usuarios del Sistema (Administradores y Novios)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(64) NOT NULL,
  `email` varchar(191) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('super_admin','admin','novios','guest') NOT NULL DEFAULT 'novios',
  `avatar_url` text DEFAULT NULL,
  `assigned_wedding_id` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabla Principal de Bodas / Eventos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `weddings` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `couple_names` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL UNIQUE,
  `wedding_date` date DEFAULT NULL,
  `wedding_time` varchar(20) DEFAULT NULL,
  `settings_json` longtext NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabla de Lista de Invitados y Pases de Protocolo
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `guests` (
  `id` varchar(64) NOT NULL,
  `wedding_id` varchar(64) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `role` varchar(100) DEFAULT 'invitado',
  `status` enum('pending','confirmed','declined') NOT NULL DEFAULT 'pending',
  `confirmed_companions` int(11) NOT NULL DEFAULT 0,
  `allowed_companions` int(11) NOT NULL DEFAULT 0,
  `table_id` varchar(64) DEFAULT NULL,
  `table_number` varchar(50) DEFAULT NULL,
  `dietary_restrictions` text DEFAULT NULL,
  `is_family` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `protocol_pass_code` varchar(64) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wedding_id` (`wedding_id`),
  KEY `idx_protocol_pass` (`protocol_pass_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Tabla de Acompañantes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `companions` (
  `id` varchar(64) NOT NULL,
  `guest_id` varchar(64) NOT NULL,
  `wedding_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `dietary_restrictions` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_guest_id` (`guest_id`),
  KEY `idx_comp_wedding` (`wedding_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Tabla de Libro de Deseos / Muro de Mensajes (Wishes)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `wishes` (
  `id` varchar(64) NOT NULL,
  `wedding_id` varchar(64) NOT NULL,
  `author_name` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `avatar_url` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wishes_wedding` (`wedding_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Tabla de Diseños de Invitación (WeddingCraft)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `weddingcraft_designs` (
  `id` varchar(64) NOT NULL,
  `wedding_id` varchar(64) NOT NULL,
  `document_json` longtext NOT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `thumbnail_url` text DEFAULT NULL,
  `version` int(11) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_wc_wedding` (`wedding_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Tabla de Imágenes y Archivos Subidos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` varchar(64) NOT NULL,
  `wedding_id` varchar(64) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` text NOT NULL,
  `file_url` text NOT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `size_bytes` bigint(20) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

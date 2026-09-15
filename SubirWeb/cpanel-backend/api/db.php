<?php
/**
 * Casanovia Self-Hosted Auto-Provisioning Database Driver
 * Compatible con cPanel / Apache / Nginx / PHP 7.4 - 8.3+
 *
 * Modo 1 (Automático por defecto): Base de datos SQLite embebida en api/data/casanovia.sqlite
 *         ¡Cero configuración requerida! Solo sube la carpeta y funciona al 100%.
 * Modo 2 (Opcional): Si configuras MySQL abajo, usará tu base de datos MySQL de cPanel.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// --------------------------------------------------------------------------
// Configuración Opcional de MySQL (Déjalo en blanco para usar SQLite automático)
// --------------------------------------------------------------------------
$USE_MYSQL = false;
$MYSQL_HOST = 'localhost';
$MYSQL_DB   = 'casanovi_wedding';
$MYSQL_USER = 'casanovi_user';
$MYSQL_PASS = '';

function getDB() {
    global $USE_MYSQL, $MYSQL_HOST, $MYSQL_DB, $MYSQL_USER, $MYSQL_PASS;
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    if ($USE_MYSQL && !empty($MYSQL_DB)) {
        try {
            $pdo = new PDO("mysql:host={$MYSQL_HOST};dbname={$MYSQL_DB};charset=utf8mb4", $MYSQL_USER, $MYSQL_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            return $pdo;
        } catch (PDOException $e) {
            // Si falla MySQL, recurre a SQLite automáticamente
        }
    }

    // Modo SQLite Automático
    $dataDir = __DIR__ . '/data';
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0755, true);
        // Proteger carpeta data contra acceso web directo
        @file_put_contents($dataDir . '/.htaccess', "Order deny,allow\nDeny from all\n");
    }

    $dbPath = $dataDir . '/casanovia.sqlite';
    $isNew = !file_exists($dbPath);

    try {
        $pdo = new PDO("sqlite:" . $dbPath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        // Inicializar tablas automáticamente en la primera ejecución
        if ($isNew || filesize($dbPath) < 100) {
            initSQLiteTables($pdo);
        }

        return $pdo;
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo inicializar la base de datos local en tu hosting: ' . $e->getMessage()
        ]);
        exit;
    }
}

function initSQLiteTables(PDO $pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            password_hash TEXT,
            name TEXT,
            role TEXT DEFAULT 'novios',
            assigned_wedding_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS weddings (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT,
            couple_names TEXT,
            slug TEXT UNIQUE,
            wedding_date TEXT,
            settings_json TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS guests (
            id TEXT PRIMARY KEY,
            wedding_id TEXT,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            role TEXT DEFAULT 'invitado',
            status TEXT DEFAULT 'pending',
            confirmed_companions INTEGER DEFAULT 0,
            allowed_companions INTEGER DEFAULT 0,
            table_id TEXT,
            table_number TEXT,
            dietary_restrictions TEXT,
            is_family INTEGER DEFAULT 0,
            notes TEXT,
            protocol_pass_code TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS wishes (
            id TEXT PRIMARY KEY,
            wedding_id TEXT,
            author_name TEXT,
            message TEXT,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS weddingcraft_designs (
            id TEXT PRIMARY KEY,
            wedding_id TEXT,
            document_json TEXT,
            is_published INTEGER DEFAULT 0,
            version INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");
}

function sendJson($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getBody() {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?: [];
}

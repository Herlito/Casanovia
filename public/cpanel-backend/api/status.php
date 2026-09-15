<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);

$uploadDir = __DIR__ . '/../uploads';
$uploadWritable = is_dir($uploadDir) && is_writable($uploadDir);

sendJson([
    'success' => true,
    'status' => 'online',
    'domain' => $_SERVER['HTTP_HOST'] ?? 'casanovia.pe',
    'databaseDriver' => $driver,
    'databaseStatus' => 'active_and_connected',
    'phpVersion' => PHP_VERSION,
    'uploadsWritable' => $uploadWritable,
    'message' => '¡Servidor Casanovia y Base de Datos Propios funcionando al 100%!'
]);

<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$base = getDataDir();
$configsDir = $base . '/system_configs';
if (!is_dir($configsDir)) {
    @mkdir($configsDir, 0755, true);
}

if ($method === 'GET') {
    $key = $_GET['key'] ?? null;
    if ($key) {
        // 1. Buscar en SQLite
        $stmt = $pdo->prepare("SELECT * FROM system_configs WHERE config_key = ? LIMIT 1");
        try {
            $stmt->execute([$key]);
            $row = $stmt->fetch();
            if ($row && !empty($row['config_value_json'])) {
                $parsed = json_decode($row['config_value_json'], true);
                sendJson(['success' => true, 'key' => $key, 'data' => $parsed]);
            }
        } catch (Exception $e) {}

        // 2. Buscar en archivo JSON en data/system_configs/{key}.json
        $filePath = $configsDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $key) . '.json';
        if (file_exists($filePath)) {
            $content = @file_get_contents($filePath);
            $parsed = @json_decode($content, true);
            if ($parsed !== null) {
                sendJson(['success' => true, 'key' => $key, 'data' => $parsed]);
            }
        }

        // 3. Buscar en seed.json si existe
        $seedFile = $base . '/seed.json';
        if (file_exists($seedFile)) {
            $seed = @json_decode(file_get_contents($seedFile), true);
            if ($key === 'tokens_payment' && !empty($seed['tokensConfig'])) {
                sendJson(['success' => true, 'key' => $key, 'data' => $seed['tokensConfig']]);
            }
            if ($key === 'uploaded_images' && !empty($seed['uploadedImages'])) {
                sendJson(['success' => true, 'key' => $key, 'data' => $seed['uploadedImages']]);
            }
        }

        sendJson(['success' => false, 'error' => 'Configuración no encontrada.'], 404);
    }

    sendJson(['success' => false, 'error' => 'Parámetro key requerido.'], 400);
}

if ($method === 'POST') {
    $body = getBody();
    $key = $body['key'] ?? null;
    $data = $body['data'] ?? null;

    if (!$key || $data === null) {
        sendJson(['success' => false, 'error' => 'Parámetros key y data requeridos.'], 400);
    }

    $jsonStr = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    // 1. Guardar en SQLite si la tabla existe
    try {
        $stmt = $pdo->prepare("INSERT OR REPLACE INTO system_configs (config_key, config_value_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$key, $jsonStr]);
    } catch (Exception $e) {
        // Fallback silencioso
    }

    // 2. Guardar en archivo JSON en data/system_configs/{key}.json
    $filePath = $configsDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $key) . '.json';
    @file_put_contents($filePath, $jsonStr);

    sendJson(['success' => true, 'message' => "Configuración '{$key}' guardada en tu hosting."]);
}

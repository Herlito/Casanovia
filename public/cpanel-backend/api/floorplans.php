<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$base = getDataDir();

if ($method === 'GET') {
    $weddingId = $_GET['wedding_id'] ?? $_GET['weddingId'] ?? null;
    if ($weddingId) {
        $stmt = $pdo->prepare("SELECT * FROM floor_plans WHERE wedding_id = ? LIMIT 1");
        $stmt->execute([$weddingId]);
        $row = $stmt->fetch();
        if ($row) {
            $parsed = json_decode($row['plan_json'], true);
            sendJson(['success' => true, 'floorPlan' => $parsed]);
        }

        // Buscar en data/floor_plans/floor_plans.json
        $fpFile = $base . '/floor_plans/floor_plans.json';
        if (file_exists($fpFile)) {
            $allFp = json_decode(file_get_contents($fpFile), true) ?: [];
            if (!empty($allFp[$weddingId])) {
                sendJson(['success' => true, 'floorPlan' => $allFp[$weddingId]]);
            }
        }

        sendJson(['success' => false, 'error' => 'Plano no encontrado.'], 404);
    }

    // List all
    $fpFile = $base . '/floor_plans/floor_plans.json';
    $allFp = [];
    if (file_exists($fpFile)) {
        $allFp = json_decode(file_get_contents($fpFile), true) ?: [];
    }
    sendJson(['success' => true, 'floorPlans' => $allFp]);
}

if ($method === 'POST') {
    $body = getBody();
    $weddingId = $body['weddingId'] ?? $body['wedding_id'] ?? '';
    if (!$weddingId) {
        sendJson(['success' => false, 'error' => 'weddingId requerido.'], 400);
    }

    $planJson = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    // Guardar en SQLite
    $stmt = $pdo->prepare("INSERT OR REPLACE INTO floor_plans (wedding_id, plan_json, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)");
    $stmt->execute([$weddingId, $planJson]);

    // Guardar en data/floor_plans/floor_plans.json
    $fpFile = $base . '/floor_plans/floor_plans.json';
    $allFp = [];
    if (file_exists($fpFile)) {
        $allFp = json_decode(file_get_contents($fpFile), true) ?: [];
    }
    $allFp[$weddingId] = $body;
    @file_put_contents($fpFile, json_encode($allFp, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

    sendJson(['success' => true, 'message' => 'Plano guardado en tu hosting.']);
}

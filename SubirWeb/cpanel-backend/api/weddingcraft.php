<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $weddingId = $_GET['wedding_id'] ?? null;
    $publishedOnly = !empty($_GET['published']);

    if ($weddingId) {
        $sql = "SELECT * FROM weddingcraft_designs WHERE wedding_id = ? " . ($publishedOnly ? "AND is_published = 1 " : "") . "ORDER BY updated_at DESC LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$weddingId]);
        $row = $stmt->fetch();
        if ($row) {
            $row['document'] = json_decode($row['document_json'], true);
            unset($row['document_json']);
            sendJson(['success' => true, 'design' => $row]);
        } else {
            sendJson(['success' => false, 'error' => 'No hay diseño guardado.'], 404);
        }
    }

    sendJson(['success' => false, 'error' => 'wedding_id requerido.'], 400);
}

if ($method === 'POST') {
    $body = getBody();
    $id = $body['id'] ?? uniqid('wc_');
    $weddingId = $body['weddingId'] ?? $body['wedding_id'] ?? '';
    $documentJson = json_encode($body['document'] ?? $body, JSON_UNESCAPED_UNICODE);
    $isPublished = !empty($body['isPublished']) || !empty($body['is_published']) ? 1 : 0;

    try {
        $stmt = $pdo->prepare("INSERT INTO weddingcraft_designs (id, wedding_id, document_json, is_published, updated_at) 
                               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                               ON CONFLICT(id) DO UPDATE SET
                               document_json=excluded.document_json,
                               is_published=excluded.is_published,
                               updated_at=CURRENT_TIMESTAMP");
        $stmt->execute([$id, $weddingId, $documentJson, $isPublished]);
    } catch (Exception $e) {
        $stmtFallback = $pdo->prepare("REPLACE INTO weddingcraft_designs (id, wedding_id, document_json, is_published) VALUES (?, ?, ?, ?)");
        $stmtFallback->execute([$id, $weddingId, $documentJson, $isPublished]);
    }

    sendJson(['success' => true, 'id' => $id, 'message' => 'Diseño WeddingCraft guardado en tu hosting.']);
}

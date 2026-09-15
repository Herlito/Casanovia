<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $slug = $_GET['slug'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare("SELECT * FROM weddings WHERE id = ? LIMIT 1");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if ($row) {
            $row['settings'] = json_decode($row['settings_json'], true) ?: [];
            unset($row['settings_json']);
            sendJson(['success' => true, 'wedding' => $row]);
        } else {
            sendJson(['success' => false, 'error' => 'Boda no encontrada.'], 404);
        }
    }

    if ($slug) {
        $stmt = $pdo->prepare("SELECT * FROM weddings WHERE slug = ? AND is_active = 1 LIMIT 1");
        $stmt->execute([$slug]);
        $row = $stmt->fetch();
        if ($row) {
            $row['settings'] = json_decode($row['settings_json'], true) ?: [];
            unset($row['settings_json']);
            sendJson(['success' => true, 'wedding' => $row]);
        } else {
            sendJson(['success' => false, 'error' => 'Boda no encontrada con ese enlace.'], 404);
        }
    }

    // List all
    $stmt = $pdo->query("SELECT * FROM weddings ORDER BY wedding_date ASC, created_at DESC");
    $rows = $stmt->fetchAll();
    $list = [];
    foreach ($rows as $r) {
        $r['settings'] = json_decode($r['settings_json'], true) ?: [];
        unset($r['settings_json']);
        $list[] = $r;
    }
    sendJson(['success' => true, 'weddings' => $list]);
}

if ($method === 'POST') {
    $body = getBody();
    $id = $body['id'] ?? uniqid('w_');
    $userId = $body['userId'] ?? 'default_admin';
    $title = $body['title'] ?? 'Nuestra Boda';
    $coupleNames = $body['coupleNames'] ?? '';
    $slug = $body['slug'] ?? ('boda-' . substr(md5($id), 0, 6));
    $weddingDate = $body['weddingDate'] ?? date('Y-m-d');
    $settingsJson = json_encode($body['settings'] ?? $body, JSON_UNESCAPED_UNICODE);

    $stmt = $pdo->prepare("INSERT INTO weddings (id, user_id, title, couple_names, slug, wedding_date, settings_json, is_active, updated_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                           ON CONFLICT(id) DO UPDATE SET 
                           title=excluded.title, 
                           couple_names=excluded.couple_names, 
                           slug=excluded.slug, 
                           wedding_date=excluded.wedding_date, 
                           settings_json=excluded.settings_json, 
                           updated_at=CURRENT_TIMESTAMP");
    try {
        $stmt->execute([$id, $userId, $title, $coupleNames, $slug, $weddingDate, $settingsJson]);
        sendJson(['success' => true, 'id' => $id, 'message' => 'Boda guardada correctamente en tu hosting.']);
    } catch (Exception $e) {
        // Fallback for MySQL REPLACE INTO
        $stmtFallback = $pdo->prepare("REPLACE INTO weddings (id, user_id, title, couple_names, slug, wedding_date, settings_json, is_active) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
        $stmtFallback->execute([$id, $userId, $title, $coupleNames, $slug, $weddingDate, $settingsJson]);
        sendJson(['success' => true, 'id' => $id]);
    }
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM weddings WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true, 'message' => 'Boda eliminada.']);
    }
    sendJson(['success' => false, 'error' => 'ID requerido.'], 400);
}

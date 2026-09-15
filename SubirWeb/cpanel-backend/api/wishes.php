<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $weddingId = $_GET['wedding_id'] ?? null;
    if ($weddingId) {
        $stmt = $pdo->prepare("SELECT * FROM wishes WHERE wedding_id = ? ORDER BY created_at DESC LIMIT 200");
        $stmt->execute([$weddingId]);
        $wishes = $stmt->fetchAll();
        sendJson(['success' => true, 'wishes' => $wishes]);
    }
    sendJson(['success' => false, 'error' => 'wedding_id requerido'], 400);
}

if ($method === 'POST') {
    $body = getBody();
    $id = $body['id'] ?? uniqid('wish_');
    $weddingId = $body['weddingId'] ?? $body['wedding_id'] ?? '';
    $author = trim($body['authorName'] ?? $body['author_name'] ?? 'Invitado');
    $message = trim($body['message'] ?? '');
    $avatar = $body['avatarUrl'] ?? $body['avatar_url'] ?? '';

    if (empty($message) || empty($weddingId)) {
        sendJson(['success' => false, 'error' => 'Mensaje y boda requeridos.'], 400);
    }

    $stmt = $pdo->prepare("INSERT INTO wishes (id, wedding_id, author_name, message, avatar_url, created_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
    $stmt->execute([$id, $weddingId, $author, $message, $avatar]);

    sendJson([
        'success' => true,
        'wish' => [
            'id' => $id,
            'wedding_id' => $weddingId,
            'author_name' => $author,
            'message' => $message,
            'avatar_url' => $avatar,
            'created_at' => date('Y-m-d H:i:s')
        ]
    ]);
}

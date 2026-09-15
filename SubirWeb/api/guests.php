<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $weddingId = $_GET['wedding_id'] ?? null;
    $passCode = $_GET['code'] ?? null;

    if ($passCode) {
        $stmt = $pdo->prepare("SELECT * FROM guests WHERE protocol_pass_code = ? OR id = ? LIMIT 1");
        $stmt->execute([$passCode, $passCode]);
        $guest = $stmt->fetch();
        if ($guest) {
            sendJson(['success' => true, 'guest' => $guest]);
        } else {
            sendJson(['success' => false, 'error' => 'Pase no encontrado.'], 404);
        }
    }

    if ($weddingId) {
        $stmt = $pdo->prepare("SELECT * FROM guests WHERE wedding_id = ? ORDER BY full_name ASC");
        $stmt->execute([$weddingId]);
        $guests = $stmt->fetchAll();
        sendJson(['success' => true, 'guests' => $guests]);
    }

    sendJson(['success' => false, 'error' => 'Parámetro wedding_id requerido.'], 400);
}

if ($method === 'POST') {
    $body = getBody();
    
    // Acción RSVP rápida
    if (!empty($body['action']) && $body['action'] === 'rsvp') {
        $guestId = $body['guestId'] ?? null;
        $status = $body['status'] ?? 'confirmed';
        $companions = intval($body['confirmedCompanions'] ?? 0);
        $diet = $body['dietaryRestrictions'] ?? '';

        if ($guestId) {
            $stmt = $pdo->prepare("UPDATE guests SET status = ?, confirmed_companions = ?, dietary_restrictions = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$status, $companions, $diet, $guestId]);
            sendJson(['success' => true, 'message' => 'Confirmación RSVP registrada en tu hosting.']);
        }
    }

    // Guardado o sincronización de invitado
    $id = $body['id'] ?? uniqid('g_');
    $weddingId = $body['weddingId'] ?? $body['wedding_id'] ?? '';
    $fullName = $body['fullName'] ?? $body['full_name'] ?? 'Invitado';
    $email = $body['email'] ?? '';
    $phone = $body['phone'] ?? '';
    $role = $body['role'] ?? 'invitado';
    $status = $body['status'] ?? 'pending';
    $confirmedCompanions = intval($body['confirmedCompanions'] ?? $body['confirmed_companions'] ?? 0);
    $allowedCompanions = intval($body['allowedCompanions'] ?? $body['allowed_companions'] ?? 0);
    $tableId = $body['tableId'] ?? $body['table_id'] ?? '';
    $tableNumber = $body['tableNumber'] ?? $body['table_number'] ?? '';
    $dietary = $body['dietaryRestrictions'] ?? $body['dietary_restrictions'] ?? '';
    $isFamily = !empty($body['isFamily']) || !empty($body['is_family']) ? 1 : 0;
    $notes = $body['notes'] ?? '';
    $passCode = $body['protocolPassCode'] ?? $body['protocol_pass_code'] ?? substr(md5($id . $weddingId), 0, 8);

    try {
        $stmt = $pdo->prepare("INSERT INTO guests (id, wedding_id, full_name, email, phone, role, status, confirmed_companions, allowed_companions, table_id, table_number, dietary_restrictions, is_family, notes, protocol_pass_code, updated_at)
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                               ON CONFLICT(id) DO UPDATE SET
                               full_name=excluded.full_name,
                               email=excluded.email,
                               phone=excluded.phone,
                               role=excluded.role,
                               status=excluded.status,
                               confirmed_companions=excluded.confirmed_companions,
                               allowed_companions=excluded.allowed_companions,
                               table_id=excluded.table_id,
                               table_number=excluded.table_number,
                               dietary_restrictions=excluded.dietary_restrictions,
                               is_family=excluded.is_family,
                               notes=excluded.notes,
                               protocol_pass_code=excluded.protocol_pass_code,
                               updated_at=CURRENT_TIMESTAMP");
        $stmt->execute([$id, $weddingId, $fullName, $email, $phone, $role, $status, $confirmedCompanions, $allowedCompanions, $tableId, $tableNumber, $dietary, $isFamily, $notes, $passCode]);
    } catch (Exception $e) {
        $stmtFallback = $pdo->prepare("REPLACE INTO guests (id, wedding_id, full_name, email, phone, role, status, confirmed_companions, allowed_companions, table_id, table_number, dietary_restrictions, is_family, notes, protocol_pass_code)
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmtFallback->execute([$id, $weddingId, $fullName, $email, $phone, $role, $status, $confirmedCompanions, $allowedCompanions, $tableId, $tableNumber, $dietary, $isFamily, $notes, $passCode]);
    }

    sendJson(['success' => true, 'id' => $id, 'protocolPassCode' => $passCode]);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM guests WHERE id = ?");
        $stmt->execute([$id]);
        sendJson(['success' => true, 'message' => 'Invitado eliminado.']);
    }
    sendJson(['success' => false, 'error' => 'ID requerido.'], 400);
}

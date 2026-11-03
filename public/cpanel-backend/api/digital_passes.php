<?php
/**
 * Casanovia Digital Guest Passes API
 * Handles idempotent pass creation, immutable QR token management,
 * device marker linking, access control validation, and door check-in.
 */

require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$base = getDataDir();

if ($method === 'GET') {
    $weddingId = $_GET['wedding_id'] ?? null;
    $guestId = $_GET['guest_id'] ?? null;
    $code = $_GET['code'] ?? null;
    $deviceMarker = $_GET['device_marker'] ?? null;
    $token = $_GET['token'] ?? null;

    if ($token) {
        $stmt = $pdo->prepare("SELECT * FROM digital_passes WHERE qr_token = ? LIMIT 1");
        $stmt->execute([$token]);
        $pass = $stmt->fetch();
        if ($pass) {
            $pass['companionNames'] = json_decode($pass['companion_names_json'] ?? '[]', true) ?: [];
            sendJson(['success' => true, 'pass' => formatPassOutput($pass)]);
        } else {
            sendJson(['success' => false, 'error' => 'Pase no encontrado.'], 404);
        }
    }

    if ($code) {
        $stmt = $pdo->prepare("SELECT * FROM digital_passes WHERE UPPER(guest_code) = UPPER(?) AND (wedding_id = ? OR ? IS NULL) LIMIT 1");
        $stmt->execute([$code, $weddingId, $weddingId]);
        $pass = $stmt->fetch();
        if ($pass) {
            sendJson(['success' => true, 'pass' => formatPassOutput($pass)]);
        } else {
            sendJson(['success' => false, 'error' => 'No se encontró ningún pase con este código.'], 404);
        }
    }

    if ($guestId) {
        $stmt = $pdo->prepare("SELECT * FROM digital_passes WHERE guest_id = ? AND (wedding_id = ? OR ? IS NULL) LIMIT 1");
        $stmt->execute([$guestId, $weddingId, $weddingId]);
        $pass = $stmt->fetch();
        if ($pass) {
            sendJson(['success' => true, 'pass' => formatPassOutput($pass)]);
        } else {
            sendJson(['success' => false, 'error' => 'Pase no encontrado.'], 404);
        }
    }

    if ($deviceMarker) {
        $stmt = $pdo->prepare("SELECT * FROM digital_passes WHERE device_marker = ? AND (wedding_id = ? OR ? IS NULL) ORDER BY updated_at DESC LIMIT 1");
        $stmt->execute([$deviceMarker, $weddingId, $weddingId]);
        $pass = $stmt->fetch();
        if ($pass) {
            sendJson(['success' => true, 'pass' => formatPassOutput($pass)]);
        } else {
            sendJson(['success' => false, 'error' => 'Dispositivo no reconocido.'], 404);
        }
    }

    if ($weddingId) {
        $stmt = $pdo->prepare("SELECT * FROM digital_passes WHERE wedding_id = ? ORDER BY guest_full_name ASC");
        $stmt->execute([$weddingId]);
        $rows = $stmt->fetchAll();
        $formatted = array_map('formatPassOutput', $rows);
        sendJson(['success' => true, 'passes' => $formatted]);
    }

    sendJson(['success' => false, 'error' => 'Parámetros insuficientes.'], 400);
}

if ($method === 'POST') {
    $body = getBody();
    $action = $body['action'] ?? null;

    // Action: Validate & Admit at the door
    if ($action === 'validate_entry') {
        $token = $body['token'] ?? null;
        $count = intval($body['passesToAdmit'] ?? 1);

        if (!$token) {
            sendJson(['success' => false, 'error' => 'Token requerido.'], 400);
        }

        $stmt = $pdo->prepare("SELECT * FROM digital_passes WHERE qr_token = ? LIMIT 1");
        $stmt->execute([$token]);
        $pass = $stmt->fetch();

        if (!$pass) {
            sendJson(['success' => false, 'error' => 'Token no reconocido.'], 404);
        }

        $confirmed = intval($pass['confirmed_passes'] ?? 1);
        $used = intval($pass['used_passes'] ?? 0);
        $available = max(0, $confirmed - $used);

        if ($available <= 0) {
            sendJson(['success' => false, 'error' => 'Pases agotados.'], 403);
        }

        $toAdmit = min($count, $available);
        $newUsed = $used + $toAdmit;
        $newStatus = ($newUsed >= $confirmed) ? 'used' : 'active';

        $update = $pdo->prepare("UPDATE digital_passes SET used_passes = ?, access_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $update->execute([$newUsed, $newStatus, $pass['id']]);

        $pass['used_passes'] = $newUsed;
        $pass['access_status'] = $newStatus;
        sendJson(['success' => true, 'pass' => formatPassOutput($pass), 'admitted' => $toAdmit]);
    }

    // Action: Create or Update Pass
    $id = $body['id'] ?? uniqid('pass_');
    $weddingId = $body['weddingId'] ?? $body['wedding_id'] ?? '';
    $guestId = $body['guestId'] ?? $body['guest_id'] ?? '';
    $guestCode = $body['guestCode'] ?? $body['guest_code'] ?? '';
    $guestFullName = $body['guestFullName'] ?? $body['guest_full_name'] ?? 'Invitado';
    $totalPasses = intval($body['totalPasses'] ?? $body['total_passes'] ?? 1);
    $confirmedPasses = intval($body['confirmedPasses'] ?? $body['confirmed_passes'] ?? 1);
    $companionNames = $body['companionNames'] ?? $body['companion_names'] ?? [];
    $companionNamesJson = json_encode($companionNames, JSON_UNESCAPED_UNICODE);
    $assignedTable = $body['assignedTable'] ?? $body['assigned_table'] ?? null;
    $assignedSeat = $body['assignedSeat'] ?? $body['assigned_seat'] ?? null;
    $deviceMarker = $body['deviceMarker'] ?? $body['device_marker'] ?? null;
    $usedPasses = intval($body['usedPasses'] ?? $body['used_passes'] ?? 0);
    $accessStatus = $body['accessStatus'] ?? $body['access_status'] ?? 'active';
    $validFrom = $body['validFrom'] ?? $body['valid_from'] ?? null;
    $validUntil = $body['validUntil'] ?? $body['valid_until'] ?? null;

    if (!$weddingId || !$guestId) {
        sendJson(['success' => false, 'error' => 'weddingId y guestId requeridos.'], 400);
    }

    // Check if pass already exists for this guest to GUARANTEE IMMUTABLE QR TOKEN
    $existingStmt = $pdo->prepare("SELECT * FROM digital_passes WHERE guest_id = ? LIMIT 1");
    $existingStmt->execute([$guestId]);
    $existing = $existingStmt->fetch();

    if ($existing) {
        // Reuse exact immutable QR token and existing ID
        $qrToken = $existing['qr_token'];
        $id = $existing['id'];

        $stmt = $pdo->prepare("UPDATE digital_passes SET 
            guest_full_name = ?,
            total_passes = ?,
            confirmed_passes = ?,
            companion_names_json = ?,
            assigned_table = ?,
            assigned_seat = ?,
            device_marker = COALESCE(?, device_marker),
            access_status = ?,
            updated_at = CURRENT_TIMESTAMP
            WHERE id = ?");
        $stmt->execute([
            $guestFullName,
            $totalPasses,
            $confirmedPasses,
            $companionNamesJson,
            $assignedTable,
            $assignedSeat,
            $deviceMarker,
            $accessStatus,
            $id
        ]);
    } else {
        // Generate cryptographic token if not supplied
        $qrToken = $body['qrToken'] ?? $body['qr_token'] ?? ('cnv_pass_' . bin2hex(random_bytes(16)));

        $stmt = $pdo->prepare("INSERT INTO digital_passes (
            id, wedding_id, guest_id, guest_code, qr_token, guest_full_name,
            total_passes, confirmed_passes, companion_names_json, assigned_table,
            assigned_seat, device_marker, used_passes, access_status, valid_from, valid_until,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)");
        $stmt->execute([
            $id, $weddingId, $guestId, $guestCode, $qrToken, $guestFullName,
            $totalPasses, $confirmedPasses, $companionNamesJson, $assignedTable,
            $assignedSeat, $deviceMarker, $usedPasses, $accessStatus, $validFrom, $validUntil
        ]);
    }

    // Fetch and return fresh record
    $fetchStmt = $pdo->prepare("SELECT * FROM digital_passes WHERE id = ? LIMIT 1");
    $fetchStmt->execute([$id]);
    $saved = $fetchStmt->fetch();

    // Mirror to JSON file in api/data/digital_passes/ for file-based resilience
    $passDir = $base . '/digital_passes';
    if (!is_dir($passDir)) @mkdir($passDir, 0700, true);
    $mirrorFile = $passDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '', $weddingId) . '_' . preg_replace('/[^a-zA-Z0-9_-]/', '', $guestId) . '.json';
    @file_put_contents($mirrorFile, json_encode(formatPassOutput($saved), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    sendJson(['success' => true, 'pass' => formatPassOutput($saved)]);
}

function formatPassOutput($row) {
    if (!$row) return null;
    return [
        'id' => $row['id'],
        'weddingId' => $row['wedding_id'],
        'guestId' => $row['guest_id'],
        'guestCode' => $row['guest_code'],
        'qrToken' => $row['qr_token'],
        'guestFullName' => $row['guest_full_name'],
        'totalPasses' => intval($row['total_passes']),
        'confirmedPasses' => intval($row['confirmed_passes']),
        'companionNames' => json_decode($row['companion_names_json'] ?? '[]', true) ?: [],
        'assignedTable' => $row['assigned_table'] ?: undefined,
        'assignedSeat' => $row['assigned_seat'] ?: undefined,
        'deviceMarker' => $row['device_marker'],
        'usedPasses' => intval($row['used_passes']),
        'accessStatus' => $row['access_status'],
        'validFrom' => $row['valid_from'],
        'validUntil' => $row['valid_until'],
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at']
    ];
}

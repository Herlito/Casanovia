<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$base = getDataDir();

if ($method === 'GET') {
    // List system users
    $stmt = $pdo->query("SELECT * FROM users ORDER BY level ASC, created_at ASC");
    $rows = $stmt->fetchAll();
    $users = [];
    foreach ($rows as $r) {
        $assigned = json_decode($r['assigned_wedding_ids'] ?? '[]', true) ?: [];
        $created = json_decode($r['created_wedding_ids'] ?? '[]', true) ?: [];
        $users[] = [
            'id' => $r['id'],
            'username' => $r['username'],
            'clave' => $r['clave'],
            'level' => intval($r['level']),
            'roleTitle' => $r['role_title'],
            'assignedWeddingIds' => $assigned,
            'createdWeddingIds' => $created,
            'isSystemDefault' => (bool)$r['is_system_default'],
            'createdAt' => $r['created_at']
        ];
    }

    if (empty($users)) {
        $usersFile = $base . '/users/system_users.json';
        if (file_exists($usersFile)) {
            $users = json_decode(file_get_contents($usersFile), true) ?: [];
        }
    }

    sendJson(['success' => true, 'users' => $users]);
}

if ($method === 'POST') {
    $body = getBody();
    $action = $body['action'] ?? 'save_user';

    if ($action === 'login') {
        $usernameOrClave = trim($body['username'] ?? $body['clave'] ?? '');
        $clave = trim($body['clave'] ?? '');

        $usersFile = $base . '/users/system_users.json';
        $usersList = [];
        if (file_exists($usersFile)) {
            $usersList = json_decode(file_get_contents($usersFile), true) ?: [];
        }

        foreach ($usersList as $u) {
            if ($u['clave'] === $clave || (strcasecmp($u['username'], $usernameOrClave) === 0 && $u['clave'] === $clave)) {
                sendJson(['success' => true, 'user' => $u]);
            }
        }

        // Direct check in DB
        $stmt = $pdo->prepare("SELECT * FROM users WHERE clave = ? LIMIT 1");
        $stmt->execute([$clave]);
        $row = $stmt->fetch();
        if ($row) {
            sendJson(['success' => true, 'user' => [
                'id' => $row['id'],
                'username' => $row['username'],
                'clave' => $row['clave'],
                'level' => intval($row['level']),
                'roleTitle' => $row['role_title'],
                'assignedWeddingIds' => json_decode($row['assigned_wedding_ids'] ?? '[]', true),
                'createdWeddingIds' => json_decode($row['created_wedding_ids'] ?? '[]', true),
                'isSystemDefault' => (bool)$row['is_system_default'],
            ]]);
        }

        sendJson(['success' => false, 'error' => 'Clave de acceso incorrecta.'], 401);
    }

    if ($action === 'save_users_bulk' || $action === 'sync_users') {
        $users = $body['users'] ?? [];
        if (is_array($users)) {
            $usersFile = $base . '/users/system_users.json';
            @file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

            foreach ($users as $u) {
                $id = $u['id'] ?? uniqid('usr_');
                $username = $u['username'] ?? '';
                $clave = $u['clave'] ?? '';
                $level = $u['level'] ?? 2;
                $roleTitle = $u['roleTitle'] ?? '';
                $assigned = json_encode($u['assignedWeddingIds'] ?? []);
                $created = json_encode($u['createdWeddingIds'] ?? []);
                $isDefault = !empty($u['isSystemDefault']) ? 1 : 0;

                $stmt = $pdo->prepare("INSERT OR REPLACE INTO users (id, username, clave, level, role_title, assigned_wedding_ids, created_wedding_ids, is_system_default, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
                $stmt->execute([$id, $username, $clave, $level, $roleTitle, $assigned, $created, $isDefault]);
            }

            sendJson(['success' => true, 'message' => 'Usuarios sincronizados en el hosting.']);
        }
    }

    if ($action === 'save_user') {
        $user = $body['user'] ?? $body;
        $id = $user['id'] ?? uniqid('usr_');
        $username = $user['username'] ?? '';
        $clave = $user['clave'] ?? '';
        $level = $user['level'] ?? 2;
        $roleTitle = $user['roleTitle'] ?? '';
        $assigned = json_encode($user['assignedWeddingIds'] ?? []);
        $created = json_encode($user['createdWeddingIds'] ?? []);
        $isDefault = !empty($user['isSystemDefault']) ? 1 : 0;

        $stmt = $pdo->prepare("INSERT OR REPLACE INTO users (id, username, clave, level, role_title, assigned_wedding_ids, created_wedding_ids, is_system_default, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$id, $username, $clave, $level, $roleTitle, $assigned, $created, $isDefault]);

        // Update JSON file
        $usersFile = $base . '/users/system_users.json';
        $usersList = [];
        if (file_exists($usersFile)) {
            $usersList = json_decode(file_get_contents($usersFile), true) ?: [];
        }
        $usersList = array_values(array_filter($usersList, function($u) use ($id) { return ($u['id'] ?? '') !== $id; }));
        $usersList[] = $user;
        @file_put_contents($usersFile, json_encode($usersList, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        sendJson(['success' => true, 'id' => $id, 'message' => 'Usuario guardado en tu hosting.']);
    }

    sendJson(['success' => false, 'error' => 'Acción inválida.'], 400);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);

        $usersFile = $base . '/users/system_users.json';
        if (file_exists($usersFile)) {
            $usersList = json_decode(file_get_contents($usersFile), true) ?: [];
            $usersList = array_values(array_filter($usersList, function($u) use ($id) { return ($u['id'] ?? '') !== $id; }));
            @file_put_contents($usersFile, json_encode($usersList, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        }

        sendJson(['success' => true, 'message' => 'Usuario eliminado del hosting.']);
    }
    sendJson(['success' => false, 'error' => 'ID requerido.'], 400);
}

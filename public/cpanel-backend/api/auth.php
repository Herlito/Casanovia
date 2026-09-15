<?php
require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $body = getBody();
    $action = $body['action'] ?? 'login';

    if ($action === 'register') {
        $email = trim(strtolower($body['email'] ?? ''));
        $password = $body['password'] ?? '';
        $name = trim($body['name'] ?? 'Usuario');
        $role = $body['role'] ?? 'novios';

        if (empty($email) || empty($password)) {
            sendJson(['success' => false, 'error' => 'Email y contraseña requeridos.'], 400);
        }

        $hash = password_hash($password, PASSWORD_DEFAULT);
        $id = uniqid('usr_');

        try {
            $stmt = $pdo->prepare("INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$id, $email, $hash, $name, $role]);
            sendJson([
                'success' => true,
                'user' => [
                    'id' => $id,
                    'email' => $email,
                    'name' => $name,
                    'role' => $role
                ]
            ]);
        } catch (Exception $e) {
            sendJson(['success' => false, 'error' => 'El email ya se encuentra registrado.'], 400);
        }
    }

    if ($action === 'login') {
        $email = trim(strtolower($body['email'] ?? ''));
        $password = $body['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            unset($user['password_hash']);
            sendJson(['success' => true, 'user' => $user]);
        } else {
            sendJson(['success' => false, 'error' => 'Credenciales inválidas.'], 401);
        }
    }
}

if ($method === 'GET') {
    // List users for admin
    $stmt = $pdo->query("SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC");
    $users = $stmt->fetchAll();
    sendJson(['success' => true, 'users' => $users]);
}

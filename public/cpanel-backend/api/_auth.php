<?php
/**
 * Casanovia shared security bootstrap.
 * Required at the top of every API endpoint.
 *
 * Levels: 1 = super admin (highest privilege) ... 5 = observer (lowest privilege).
 * Higher level number == LESS privilege.
 */

if (!defined('CASANOVIA_PUBLIC_HOST')) {
    define('CASANOVIA_PUBLIC_HOST', getenv('CASANOVIA_PUBLIC_HOST') ?: 'https://www.casanovia.pe');
}

function casanovia_allowed_origins() {
    $origins = [];
    $env = getenv('CASANOVIA_ALLOWED_ORIGINS');
    if ($env !== false && $env !== '') {
        foreach (explode(',', $env) as $o) {
            $o = trim($o);
            if ($o !== '') $origins[] = $o;
        }
    }
    if (defined('CASANOVIA_PUBLIC_HOST') && CASANOVIA_PUBLIC_HOST) {
        $origins[] = rtrim(CASANOVIA_PUBLIC_HOST, '/');
    }
    return array_values(array_unique($origins));
}

function casanovia_origin_allowed($origin) {
    if (empty($origin)) return false;
    $origin = rtrim($origin, '/');
    foreach (casanovia_allowed_origins() as $allowed) {
        if (strcasecmp($origin, rtrim($allowed, '/')) === 0) return true;
    }
    return false;
}

function cors_headers() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (casanovia_origin_allowed($origin)) {
        header('Access-Control-Allow-Origin: ' . rtrim($origin, '/'));
        header('Access-Control-Allow-Credentials: true');
        header('Vary: Origin');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-CSRF-Token');
    header('Access-Control-Max-Age: 86400');
}

function start_session() {
    if (session_status() === PHP_SESSION_ACTIVE) return;
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && intval($_SERVER['SERVER_PORT']) === 443)
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https');
    $params = [
        'lifetime' => 0,
        'path' => '/',
        'domain' => '',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ];
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params($params);
    } else {
        session_set_cookie_params(0, '/; samesite=Strict', '', $secure, true);
    }
    session_name('CASANOVIASESSID');
    session_start();
}

function current_user() {
    if (session_status() !== PHP_SESSION_ACTIVE) start_session();
    if (!empty($_SESSION['user']) && is_array($_SESSION['user'])) {
        return $_SESSION['user'];
    }
    return null;
}

function require_auth($minLevel = 5) {
    $user = current_user();
    if (!$user) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'No autenticado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $level = isset($user['level']) ? intval($user['level']) : 5;
    if ($level !== 1 && $level > $minLevel) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Permisos insuficientes.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return $user;
}

function assert_wedding_access($weddingId, array $user) {
    $weddingId = trim((string)$weddingId);
    if ($weddingId === '') {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'weddingId requerido.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $level = isset($user['level']) ? intval($user['level']) : 5;
    if ($level === 1) return;
    $assigned = isset($user['assignedWeddingIds']) && is_array($user['assignedWeddingIds']) ? $user['assignedWeddingIds'] : [];
    $created = isset($user['createdWeddingIds']) && is_array($user['createdWeddingIds']) ? $user['createdWeddingIds'] : [];
    $all = array_merge($assigned, $created);
    foreach ($all as $wid) {
        if (strcasecmp(trim((string)$wid), $weddingId) === 0) return;
    }
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Sin acceso a esta boda.'], JSON_UNESCAPED_UNICODE);
    exit;
}

function issue_csrf_token() {
    if (session_status() !== PHP_SESSION_ACTIVE) start_session();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function require_csrf() {
    if (session_status() !== PHP_SESSION_ACTIVE) start_session();
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) return;
    $sent = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    $stored = $_SESSION['csrf_token'] ?? '';
    if ($stored === '' || $sent === '' || !hash_equals($stored, $sent)) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Token CSRF inválido o ausente.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function public_user(array $row) {
    $out = [
        'id' => $row['id'] ?? '',
        'username' => $row['username'] ?? '',
        'level' => isset($row['level']) ? intval($row['level']) : 5,
        'roleTitle' => $row['roleTitle'] ?? ($row['role_title'] ?? ''),
        'assignedWeddingIds' => (isset($row['assignedWeddingIds']) && is_array($row['assignedWeddingIds'])) ? array_values($row['assignedWeddingIds']) : [],
        'createdWeddingIds' => (isset($row['createdWeddingIds']) && is_array($row['createdWeddingIds'])) ? array_values($row['createdWeddingIds']) : [],
        'isSystemDefault' => !empty($row['isSystemDefault']),
        'createdAt' => $row['createdAt'] ?? ($row['created_at'] ?? ''),
    ];
    return $out;
}

function json_write_atomic($path, $data) {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    if ($json === false) return false;
    $tmp = $path . '.tmp.' . bin2hex(random_bytes(6));
    if (@file_put_contents($tmp, $json, LOCK_EX) === false) {
        @unlink($tmp);
        return false;
    }
    if (!@rename($tmp, $path)) {
        @unlink($tmp);
        return false;
    }
    return true;
}

function safe_slug($name) {
    $name = basename((string)$name);
    if ($name === '' || $name === '.' || $name === '..') return '';
    if (strpos($name, '..') !== false) return '';
    if (!preg_match('/^[A-Za-z0-9._-]{1,128}$/', $name)) return '';
    return $name;
}

function safe_path($base, $name, $ext) {
    $name = safe_slug($name);
    if ($name === '') return null;
    $baseReal = realpath($base);
    if ($baseReal === false) return null;
    $candidate = $baseReal . DIRECTORY_SEPARATOR . $name . $ext;
    $dirReal = realpath(dirname($candidate));
    if ($dirReal === false) return null;
    $prefix = rtrim($baseReal, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;
    if (strpos($dirReal . DIRECTORY_SEPARATOR, $prefix) !== 0) return null;
    if (strpos($candidate, $prefix) !== 0) return null;
    return $candidate;
}

function login_throttle_check() {
    $state = isset($_SESSION['login_attempts']) ? intval($_SESSION['login_attempts']) : 0;
    if ($state >= 5) {
        sleep(1);
    }
}

function login_throttle_record_fail() {
    if (session_status() !== PHP_SESSION_ACTIVE) start_session();
    $_SESSION['login_attempts'] = (isset($_SESSION['login_attempts']) ? intval($_SESSION['login_attempts']) : 0) + 1;
    $_SESSION['last_login_attempt'] = time();
}

function login_throttle_reset() {
    if (session_status() !== PHP_SESSION_ACTIVE) start_session();
    unset($_SESSION['login_attempts'], $_SESSION['last_login_attempt']);
}

function request_origin_is_same_host() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        $ref = $_SERVER['HTTP_REFERER'] ?? '';
        if ($ref === '') return false;
        $host = parse_url($ref, PHP_URL_HOST);
        $origin = $host ? ('https://' . $host) : '';
    }
    return casanovia_origin_allowed($origin);
}

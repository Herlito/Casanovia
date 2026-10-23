<?php
/**
 * Casanovia Hosting Backend & Storage Engine
 * Compatible con cPanel / Apache / Nginx / LiteSpeed / PHP 7.4 - 8.4+
 */

require_once __DIR__ . '/_auth.php';

cors_headers();
start_session();
header('Content-Type: application/json; charset=utf-8');

if (!in_array('ob_gzhandler', ob_list_handlers()) && extension_loaded('zlib') && !headers_sent()) {
    @ob_start('ob_gzhandler');
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// --------------------------------------------------------------------------
// Configuración Opcional de MySQL (Dejar en blanco para usar SQLite automático)
// --------------------------------------------------------------------------
$USE_MYSQL = in_array(strtolower((string)getenv('CASANOVIA_USE_MYSQL')), ['1', 'true', 'yes'], true);
$MYSQL_HOST = getenv('CASANOVIA_DB_HOST') ?: '';
$MYSQL_DB   = getenv('CASANOVIA_DB_NAME') ?: '';
$MYSQL_USER = getenv('CASANOVIA_DB_USER') ?: '';
$MYSQL_PASS = getenv('CASANOVIA_DB_PASS') ?: '';

function getDataDir() {
    $dir = __DIR__ . '/data';
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    $guard = $dir . '/.htaccess';
    @file_put_contents($guard, casanovia_data_htaccess());
    return $dir;
}

function casanovia_data_htaccess() {
    return "<IfModule mod_authz_core.c>\n  Require all denied\n</IfModule>\n<IfModule !mod_authz_core.c>\n  Order allow,deny\n  Deny from all\n</IfModule>\n";
}

function ensureSubfolders() {
    $base = getDataDir();
    $subdirs = [
        'weddings',
        'weddingcraft/published',
        'weddingcraft/templates',
        'weddingcraft/library',
        'users',
        'floor_plans',
        'system_configs'
    ];
    foreach ($subdirs as $sub) {
        $target = $base . '/' . $sub;
        if (!is_dir($target)) {
            @mkdir($target, 0700, true);
        }
    }
}

function getDB() {
    global $USE_MYSQL, $MYSQL_HOST, $MYSQL_DB, $MYSQL_USER, $MYSQL_PASS;
    static $pdo = null;

    if ($pdo !== null) {
        return $pdo;
    }

    ensureSubfolders();

    if ($USE_MYSQL && !empty($MYSQL_DB)) {
        try {
            $pdo = new PDO("mysql:host={$MYSQL_HOST};dbname={$MYSQL_DB};charset=utf8mb4", $MYSQL_USER, $MYSQL_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            initTables($pdo);
            return $pdo;
        } catch (PDOException $e) {
            error_log('Casanovia MySQL connection failed: ' . $e->getMessage());
        }
    }

    $dbPath = getDataDir() . '/casanovia.sqlite';
    try {
        $pdo = new PDO("sqlite:" . $dbPath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        initTables($pdo);
        return $pdo;
    } catch (Exception $e) {
        error_log('Casanovia SQLite init failed: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'No se pudo inicializar la base de datos.'
        ]);
        exit;
    }
}

function initTables(PDO $pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT,
            clave TEXT,
            level INTEGER DEFAULT 2,
            role_title TEXT,
            assigned_wedding_ids TEXT,
            created_wedding_ids TEXT,
            is_system_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS weddings (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            title TEXT,
            couple_names TEXT,
            slug TEXT UNIQUE,
            wedding_date TEXT,
            wedding_data_json TEXT,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS guests (
            id TEXT PRIMARY KEY,
            wedding_id TEXT,
            full_name TEXT,
            email TEXT,
            phone TEXT,
            role TEXT DEFAULT 'invitado',
            status TEXT DEFAULT 'pending',
            confirmed_companions INTEGER DEFAULT 0,
            allowed_companions INTEGER DEFAULT 0,
            table_id TEXT,
            table_number TEXT,
            dietary_restrictions TEXT,
            is_family INTEGER DEFAULT 0,
            notes TEXT,
            protocol_pass_code TEXT,
            raw_data_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS wishes (
            id TEXT PRIMARY KEY,
            wedding_id TEXT,
            author_name TEXT,
            message TEXT,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS weddingcraft_designs (
            id TEXT PRIMARY KEY,
            wedding_id TEXT,
            document_json TEXT,
            is_published INTEGER DEFAULT 0,
            version INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS weddingcraft_templates (
            id TEXT PRIMARY KEY,
            name TEXT,
            author TEXT,
            template_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS weddingcraft_library (
            id TEXT PRIMARY KEY,
            template_name TEXT,
            element_json TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            saved_by TEXT
        );

        CREATE TABLE IF NOT EXISTS floor_plans (
            wedding_id TEXT PRIMARY KEY,
            plan_json TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS uploaded_files (
            id TEXT PRIMARY KEY,
            file_name TEXT,
            file_path TEXT,
            file_url TEXT,
            mime_type TEXT,
            size_bytes INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    ");

    syncFromJsonFilesToSqlite($pdo);
    seedInitialAdmin($pdo);
}

/**
 * Bootstrap del administrador inicial (nivel 1).
 *
 * Se ejecuta una sola vez: si la tabla `users` esta vacia se crea un
 * administrador nivel 1. La contrasena NUNCA viaja en el bundle JS:
 *   - se toma de la variable de entorno CASANOVIA_ADMIN_PASSWORD, o
 *   - se genera una aleatoria y se escribe en
 *     api/data/users/initial_admin_credentials.txt (protegido por .htaccess)
 *     y en el log de errores del servidor.
 *
 * Variables de entorno opcionales:
 *   CASANOVIA_ADMIN_USERNAME  (por defecto: Herly Lizarazo)
 *   CASANOVIA_ADMIN_PASSWORD  (si se omite, se genera una)
 */
function seedInitialAdmin(PDO $pdo) {
    try {
        $count = $pdo->query("SELECT COUNT(*) AS c FROM users")->fetch();
    } catch (Exception $e) {
        error_log('Casanovia bootstrap admin check failed: ' . $e->getMessage());
        return;
    }
    if (intval($count['c'] ?? 0) > 0) return;

    $username = getenv('CASANOVIA_ADMIN_USERNAME');
    if ($username === false || trim((string)$username) === '') {
        $username = 'Herly Lizarazo';
    }
    $username = trim((string)$username);

    $password = getenv('CASANOVIA_ADMIN_PASSWORD');
    $generated = false;
    if ($password === false || trim((string)$password) === '') {
        $generated = true;
        $password = rtrim(strtr(base64_encode(random_bytes(12)), '+/', '-_'), '=');
    }
    $password = (string)$password;

    $id = 'user-herly';
    $roleTitle = 'Director General & Protocolo (Nivel 1 - Super Admin)';

    try {
        $stmt = $pdo->prepare("INSERT OR REPLACE INTO users (id, username, clave, level, role_title, assigned_wedding_ids, created_wedding_ids, is_system_default, updated_at) VALUES (?, ?, ?, 1, ?, '[]', '[]', 1, CURRENT_TIMESTAMP)");
        $stmt->execute([$id, $username, password_hash($password, PASSWORD_DEFAULT), $roleTitle]);
    } catch (Exception $e) {
        error_log('Casanovia bootstrap admin failed: ' . $e->getMessage());
        return;
    }

    if ($generated) {
        $target = getDataDir() . '/users/initial_admin_credentials.txt';
        $content = "Casanovia - Administrador inicial\n"
            . "Usuario: $username\n"
            . "Contrasena: $password\n"
            . "Generado: " . date('c') . "\n\n"
            . "CAMBIA ESTA CONTRASENA desde la aplicacion o con api/admin_reset_password.php\n"
            . "Este archivo esta protegido por api/data/.htaccess y no es accesible por web.\n";
        @file_put_contents($target, $content);
        @chmod($target, 0600);
        error_log('Casanovia bootstrap admin created. Usuario: ' . $username . ' | contrasena en: ' . $target);
    } else {
        error_log('Casanovia bootstrap admin created from environment. Usuario: ' . $username);
    }
}

function syncFromJsonFilesToSqlite(PDO $pdo) {
    $base = getDataDir();

    $weddingsDir = $base . '/weddings';
    if (is_dir($weddingsDir)) {
        $files = glob($weddingsDir . '/*.json');
        if (!empty($files)) {
            $stmt = $pdo->prepare("INSERT OR IGNORE INTO weddings (id, user_id, title, couple_names, slug, wedding_date, wedding_data_json, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
            foreach ($files as $file) {
                $content = @file_get_contents($file);
                $w = @json_decode($content, true);
                if (!empty($w['id'])) {
                    $wId = $w['id'];
                    $uId = $w['createdByUserId'] ?? $w['userId'] ?? 'user-herly';
                    $title = $w['coupleNames'] ?? $w['title'] ?? 'Boda';
                    $names = $w['coupleNames'] ?? '';
                    $slug = $w['slug'] ?? $wId;
                    $wDate = $w['weddingDate'] ?? date('Y-m-d');
                    $stmt->execute([$wId, $uId, $title, $names, $slug, $wDate, $content]);
                }
            }
        }
    }

    $pubDir = $base . '/weddingcraft/published';
    if (is_dir($pubDir)) {
        $files = glob($pubDir . '/*.json');
        if (!empty($files)) {
            $stmt = $pdo->prepare("INSERT OR IGNORE INTO weddingcraft_designs (id, wedding_id, document_json, is_published) VALUES (?, ?, ?, 1)");
            foreach ($files as $file) {
                $wId = basename($file, '.json');
                $content = @file_get_contents($file);
                if (!empty($content)) {
                    $stmt->execute(['pub_' . $wId, $wId, $content]);
                }
            }
        }
    }

    $tplDir = $base . '/weddingcraft/templates';
    if (is_dir($tplDir)) {
        $files = glob($tplDir . '/*.json');
        if (!empty($files)) {
            $stmt = $pdo->prepare("INSERT OR IGNORE INTO weddingcraft_templates (id, name, author, template_json) VALUES (?, ?, ?, ?)");
            foreach ($files as $file) {
                $tId = basename($file, '.json');
                $content = @file_get_contents($file);
                $t = @json_decode($content, true);
                if ($t) {
                    $name = $t['name'] ?? $tId;
                    $author = $t['author'] ?? 'WeddingCraft';
                    $stmt->execute([$tId, $name, $author, $content]);
                }
            }
        }
    }
}

function sendJson($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function computeEventSlug($data, $dateArg = null) {
    if (is_array($data)) {
        $idStr = (string)($data['id'] ?? '');
        $couple = $data['coupleNames'] ?? $data['title'] ?? $data['settings']['coupleNames'] ?? $idStr ?? 'evento';
        $weddingDate = $dateArg ?? $data['weddingDate'] ?? $data['wedding_date'] ?? $data['date'] ?? $data['settings']['weddingDate'] ?? $data['settings']['wedding_date'] ?? $data['settings']['date'] ?? null;
    } else {
        $idStr = (string)($data ?? '');
        $couple = $idStr ?: 'evento';
        $weddingDate = $dateArg;
    }

    $knownDates = [
        'juanjuana' => '0919',
        'erikayemar' => '1128',
        'anaedu' => '0919',
        'zenaidaronny' => '0912',
        'clinicaauna' => '0903',
        'aunaclinica' => '0903',
        'ariannatomas' => '0320',
        'ellael' => '0320',
        'lucianamateo' => '0710',
        'sofiatu' => '0918',
        'sofiat' => '0918',
        'valeriasantiago' => '0213',
        'delecapy' => '0110',
    ];

    $s = $couple;
    $s = preg_replace('/^0101[-_]?/i', '', $s);
    $s = preg_replace('/^(boda|wedding)[-_]?/i', '', $s);
    $s = preg_replace('/^\d{4}[-_]?/', '', $s);

    $cleanNames = (string)$s;
    if (function_exists('transliterator_transliterate')) {
        $trans = transliterator_transliterate('Any-Latin; Latin-ASCII; Lower()', $cleanNames);
        if ($trans !== false && $trans !== '') {
            $cleanNames = $trans;
        }
    }

    $utf8Map = [
        'á'=>'a', 'à'=>'a', 'ä'=>'a', 'â'=>'a', 'ã'=>'a', 'Á'=>'a', 'À'=>'a', 'Ä'=>'a', 'Â'=>'a', 'Ã'=>'a',
        'é'=>'e', 'è'=>'e', 'ë'=>'e', 'ê'=>'e', 'É'=>'e', 'È'=>'e', 'Ë'=>'e', 'Ê'=>'e',
        'í'=>'i', 'ì'=>'i', 'ï'=>'i', 'î'=>'i', 'Í'=>'i', 'Ì'=>'i', 'Ï'=>'i', 'Î'=>'i',
        'ó'=>'o', 'ò'=>'o', 'ö'=>'o', 'ô'=>'o', 'õ'=>'o', 'Ó'=>'o', 'Ò'=>'o', 'Ö'=>'o', 'Ô'=>'o', 'Õ'=>'o',
        'ú'=>'u', 'ù'=>'u', 'ü'=>'u', 'û'=>'u', 'Ú'=>'u', 'Ù'=>'u', 'Ü'=>'u', 'Û'=>'u',
        'ñ'=>'n', 'Ñ'=>'n', 'ç'=>'c', 'Ç'=>'c'
    ];
    $cleanNames = strtr($cleanNames, $utf8Map);
    if (function_exists('mb_strtolower')) {
        $cleanNames = mb_strtolower($cleanNames, 'UTF-8');
    } else {
        $cleanNames = strtolower($cleanNames);
    }

    $cleanNames = preg_replace('/\b(y|e|and)\b/i', '', $cleanNames);
    $cleanNames = str_replace('&', '', $cleanNames);
    $cleanNames = preg_replace('/[^a-z0-9]/', '', $cleanNames);
    $cleanNames = str_replace(['juanyjuana', 'deleycapy', 'zenaidayronny'], ['juanjuana', 'delecapy', 'zenaidaronny'], $cleanNames);

    $cleanCouple = preg_replace('/\d+$/', '', $cleanNames);
    if (!$cleanCouple) $cleanCouple = 'evento';

    $mm = null;
    $dd = null;

    if ($weddingDate) {
        if (preg_match('/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/', (string)$weddingDate, $m)) {
            $mm = str_pad($m[2], 2, '0', STR_PAD_LEFT);
            $dd = str_pad($m[3], 2, '0', STR_PAD_LEFT);
        }
    }

    if (!$mm || !$dd || ($mm === '01' && $dd === '01')) {
        if (preg_match('/(?<!0101)(?<!\d)(\d{2})(\d{2})[-_]/', $idStr, $mEmb) || preg_match('/(?<!0101)(?<!\d)(\d{2})(\d{2})[-_]/', $couple, $mEmb)) {
            if ($mEmb[1] !== '01') {
                $mm = $mEmb[1];
                $dd = $mEmb[2];
            }
        }
    }

    if ((!$mm || !$dd || ($mm === '01' && $dd === '01')) && isset($knownDates[$cleanCouple])) {
        $kDate = $knownDates[$cleanCouple];
        $mm = substr($kDate, 0, 2);
        $dd = substr($kDate, 2, 2);
    }

    if (!$mm || !$dd) {
        $mm = '01';
        $dd = '01';
    }

    return $mm . $dd . '-' . $cleanCouple;
}

function getBody() {
    $len = isset($_SERVER['CONTENT_LENGTH']) ? (int)$_SERVER['CONTENT_LENGTH'] : 0;
    if ($len > 8388608) {
        http_response_code(413);
        echo json_encode(['success' => false, 'error' => 'Cuerpo de solicitud demasiado grande.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $raw = file_get_contents('php://input', false, null, 0, 8388608);
    if ($raw === false || $raw === '') return [];
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function public_wedding_projection(array $w) {
    $out = [
        'id' => $w['id'] ?? '',
        'slug' => $w['slug'] ?? ($w['id'] ?? ''),
        'title' => $w['title'] ?? ($w['coupleNames'] ?? 'Boda'),
        'coupleNames' => $w['coupleNames'] ?? ($w['title'] ?? ''),
        'weddingDate' => $w['weddingDate'] ?? ($w['wedding_date'] ?? ''),
    ];
    if (isset($w['venue'])) $out['venue'] = $w['venue'];
    if (isset($w['location'])) $out['location'] = $w['location'];
    if (isset($w['city'])) $out['city'] = $w['city'];
    if (isset($w['coverImage'])) $out['coverImage'] = $w['coverImage'];
    if (isset($w['heroImage'])) $out['heroImage'] = $w['heroImage'];
    $guestCount = 0;
    if (isset($w['guests']) && is_array($w['guests'])) $guestCount = count($w['guests']);
    $out['guestCount'] = $guestCount;
    return $out;
}

function redact_wedding_secrets(array &$w) {
    unset($w['budget'], $w['vendors'], $w['timeline'], $w['tasks']);
    if (isset($w['guests'])) unset($w['guests']);
    if (isset($w['settings']) && is_array($w['settings'])) {
        $secretKeys = ['bankAccount', 'bankName', 'bank', 'paymentToken', 'paymentTokens', 'tokensConfig', 'apiKey', 'secret', 'mpAccessToken', 'culqiKey', 'stripeKey', 'paypalClientId', 'paypalSecret'];
        foreach ($secretKeys as $k) {
            if (isset($w['settings'][$k])) unset($w['settings'][$k]);
        }
    }
    return $w;
}

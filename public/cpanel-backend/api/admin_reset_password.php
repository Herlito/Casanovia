<?php
/**
 * Casanovia - CLI password rotation utility.
 *
 * Usage (from the CLI only):
 *   php admin_reset_password.php <username> <newpassword>
 *
 * Looks up the user by username (case-insensitive) in api/data/users/system_users.json
 * and in the SQLite users table, then stores a bcrypt hash of <newpassword>.
 * This script refuses to run over HTTP.
 */

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    echo "This script can only be run from the command line.\n";
    exit(1);
}

require_once __DIR__ . '/db.php';

$username = isset($argv[1]) ? trim($argv[1]) : '';
$newPassword = isset($argv[2]) ? (string)$argv[2] : '';

if ($username === '' || $newPassword === '') {
    fwrite(STDERR, "Usage: php admin_reset_password.php <username> <newpassword>\n");
    exit(1);
}

$base = getDataDir();
$usersFile = $base . '/users/system_users.json';
$hash = password_hash($newPassword, PASSWORD_DEFAULT);

$updated = false;

if (file_exists($usersFile)) {
    $list = @json_decode(@file_get_contents($usersFile), true);
    if (is_array($list)) {
        $wrapped = isset($list['users']) && is_array($list['users']);
        $items = $wrapped ? $list['users'] : $list;
        foreach ($items as $i => $u) {
            if (isset($u['username']) && strcasecmp(trim($u['username']), $username) === 0) {
                $items[$i]['clave'] = $hash;
                $updated = true;
            }
        }
        if ($updated) {
            if ($wrapped) {
                $list['users'] = $items;
                json_write_atomic($usersFile, $list);
            } else {
                json_write_atomic($usersFile, $items);
            }
        }
    }
}

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("UPDATE users SET clave = ?, updated_at = CURRENT_TIMESTAMP WHERE lower(username) = lower(?)");
    $stmt->execute([$hash, $username]);
    if ($stmt->rowCount() > 0) {
        $updated = true;
    }
} catch (Exception $e) {
    fwrite(STDERR, "DB update failed: " . $e->getMessage() . "\n");
}

if ($updated) {
    echo "Password updated for user '{$username}'.\n";
    exit(0);
}

fwrite(STDERR, "User '{$username}' not found.\n");
exit(1);

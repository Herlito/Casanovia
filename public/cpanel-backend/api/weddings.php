<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/sync_events.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$base = getDataDir();

// Auto-sync if any wedding lacks a slug
try {
    $checkNullSlug = $pdo->query("SELECT COUNT(*) as unslugged FROM weddings WHERE slug IS NULL OR slug = ''")->fetch();
    if (!empty($checkNullSlug['unslugged']) && $checkNullSlug['unslugged'] > 0) {
        syncAllEventsAndLinks();
    }
} catch (Exception $e) {}

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    $slug = $_GET['slug'] ?? null;
    $targetParam = $id ?: $slug;

    if ($targetParam) {
        $cleanId = preg_replace('/[-_]\d+$/', '', str_replace(['boda-', 'wedding-'], '', $targetParam));
        $cleanWithoutDate = preg_replace('/^\d{4}-/', '', $cleanId);
        $parts = preg_split('/[-_yY\s]+/', $cleanWithoutDate);
        $parts = array_values(array_filter($parts, function($p) { return strlen($p) >= 3; }));
        $name1 = $parts[0] ?? '';
        $name2 = $parts[1] ?? '';

        // 1. Buscar en SQLite
        $stmt = $pdo->prepare("SELECT * FROM weddings WHERE (
            id = ? 
            OR slug = ? 
            OR id LIKE ? 
            OR couple_names LIKE ? 
            OR (? != '' AND ? != '' AND couple_names LIKE ? AND couple_names LIKE ?)
        ) LIMIT 1");
        $stmt->execute([
            $targetParam, 
            $targetParam, 
            '%' . $cleanId . '%', 
            '%' . $cleanWithoutDate . '%',
            $name1, 
            $name2, 
            '%' . $name1 . '%', 
            '%' . $name2 . '%'
        ]);
        $row = $stmt->fetch();
        if ($row) {
            $parsed = json_decode($row['wedding_data_json'] ?? '{}', true) ?: [];
            if (!empty($parsed['id'])) {
                sendJson(['success' => true, 'wedding' => $parsed]);
            }
        }

        // 2. Buscar en archivo JSON individual en data/weddings/{weddingId}.json
        $filePath = $base . '/weddings/' . $targetParam . '.json';
        if (file_exists($filePath) && filesize($filePath) > 10) {
            $wData = json_decode(file_get_contents($filePath), true);
            if ($wData) sendJson(['success' => true, 'wedding' => $wData]);
        }

        // Buscar por coincidencia aproximada de archivo
        $weddingFiles = glob($base . '/weddings/*.json');
        foreach ($weddingFiles as $wf) {
            $baseName = basename($wf, '.json');
            if ($cleanId && stripos($baseName, $cleanId) !== false) {
                $wData = json_decode(file_get_contents($wf), true);
                if ($wData) sendJson(['success' => true, 'wedding' => $wData]);
            }
        }

        // 3. Buscar en seed.json
        $seedFile = $base . '/seed.json';
        if (file_exists($seedFile)) {
            $seedData = json_decode(file_get_contents($seedFile), true);
            if (!empty($seedData['weddings'])) {
                foreach ($seedData['weddings'] as $w) {
                    $wId = $w['id'] ?? '';
                    $wSlug = $w['slug'] ?? '';
                    if ($wId === $targetParam || $wSlug === $targetParam || ($cleanId && stripos($wId, $cleanId) !== false)) {
                        sendJson(['success' => true, 'wedding' => $w]);
                    }
                }
            }
        }

        sendJson(['success' => false, 'error' => 'Boda no encontrada.'], 404);
    }

    // List all weddings
    $stmt = $pdo->query("SELECT * FROM weddings ORDER BY wedding_date ASC, created_at DESC");
    $rows = $stmt->fetchAll();
    $rawList = [];
    foreach ($rows as $r) {
        $parsed = json_decode($r['wedding_data_json'] ?? '{}', true);
        if ($parsed && !empty($parsed['id'])) {
            $rawList[] = $parsed;
        } else {
            $rawList[] = [
                'id' => $r['id'],
                'coupleNames' => $r['couple_names'],
                'weddingDate' => $r['wedding_date'],
                'title' => $r['title'],
                'slug' => $r['slug']
            ];
        }
    }

    // Cargar también archivos en data/weddings/ para asegurar sincronía
    $files = glob($base . '/weddings/*.json');
    foreach ($files as $f) {
        $content = @file_get_contents($f);
        $w = @json_decode($content, true);
        if ($w && !empty($w['id'])) {
            $rawList[] = $w;
        }
    }

    // Fallback a seed.json si aún está vacío
    if (empty($rawList)) {
        $seedFile = $base . '/seed.json';
        if (file_exists($seedFile)) {
            $seedData = json_decode(@file_get_contents($seedFile), true);
            if (!empty($seedData['weddings'])) {
                $rawList = $seedData['weddings'];
            }
        }
    }

    // Desduplicar estricta y canónicamente por slug único (ej: 0919-anaedu)
    $grouped = [];
    foreach ($rawList as $item) {
        $cSlug = computeEventSlug($item);
        if (!$cSlug) continue;

        if (!isset($grouped[$cSlug])) {
            $grouped[$cSlug] = $item;
        } else {
            $curr = $grouped[$cSlug];
            $currIs0101 = (strpos($curr['id'] ?? '', '0101-') === 0);
            $newIs0101 = (strpos($item['id'] ?? '', '0101-') === 0);

            // Reemplazar si el actual era un prefijo 0101- y el nuevo es el ID canónico completo
            if ($currIs0101 && !$newIs0101) {
                $grouped[$cSlug] = $item;
            } elseif (count($item['guests'] ?? []) > count($curr['guests'] ?? [])) {
                $grouped[$cSlug] = $item;
            }
        }
    }

    $list = array_values($grouped);
    sendJson(['success' => true, 'weddings' => $list]);
}

if ($method === 'POST') {
    $body = getBody();
    $coupleNames = $body['coupleNames'] ?? $body['title'] ?? '';
    $weddingDate = $body['weddingDate'] ?? $body['settings']['weddingDate'] ?? date('Y-m-d');
    
    // Always compute canonical slug without 'y'
    $canonicalSlug = computeEventSlug($coupleNames, $weddingDate);
    
    $body['id'] = $canonicalSlug;
    $body['slug'] = $canonicalSlug;

    $userId = $body['createdByUserId'] ?? $body['userId'] ?? 'user-herly';
    $title = $coupleNames ?: 'Nuestra Boda';
    $fullJson = json_encode($body, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    // 1. Guardar en SQLite
    $stmt = $pdo->prepare("INSERT INTO weddings (id, user_id, title, couple_names, slug, wedding_date, wedding_data_json, is_active, updated_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
                           ON CONFLICT(id) DO UPDATE SET 
                           title=excluded.title, 
                           couple_names=excluded.couple_names, 
                           slug=excluded.slug, 
                           wedding_date=excluded.wedding_date, 
                           wedding_data_json=excluded.wedding_data_json, 
                           updated_at=CURRENT_TIMESTAMP");
    try {
        $stmt->execute([$canonicalSlug, $userId, $title, $coupleNames, $canonicalSlug, $weddingDate, $fullJson]);
    } catch (Exception $e) {
        $stmtFallback = $pdo->prepare("REPLACE INTO weddings (id, user_id, title, couple_names, slug, wedding_date, wedding_data_json, is_active) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?, 1)");
        $stmtFallback->execute([$canonicalSlug, $userId, $title, $coupleNames, $canonicalSlug, $weddingDate, $fullJson]);
    }

    // 2. Guardar en archivo JSON individual en data/weddings/{canonicalSlug}.json
    $filePath = $base . '/weddings/' . $canonicalSlug . '.json';
    @file_put_contents($filePath, $fullJson);

    sendJson(['success' => true, 'id' => $canonicalSlug, 'slug' => $canonicalSlug, 'wedding' => $body, 'message' => 'Boda guardada en tu hosting.']);
}

if ($method === 'DELETE') {
    $targetId = $_GET['id'] ?? null;
    if ($targetId) {
        $canonicalSlug = computeEventSlug($targetId);
        $cleanName = preg_replace('/^0101[-_]?/i', '', $targetId);
        $cleanName = preg_replace('/^\d{4}[-_]?/', '', $cleanName);
        $cleanName = strtolower(preg_replace('/[^a-z0-9]/i', '', $cleanName));

        $targetSlugsToDelete = array_values(array_filter(array_unique([
            strtolower(trim($targetId)),
            strtolower(trim($canonicalSlug)),
            ($cleanName && strlen($cleanName) >= 4 && $cleanName !== 'evento') ? '0101-' . $cleanName : ''
        ])));

        // 1. Eliminar de la base de datos SQLite solo registros exactos
        if (!empty($targetSlugsToDelete)) {
            $inClause = implode(',', array_fill(0, count($targetSlugsToDelete), '?'));
            $stmt = $pdo->prepare("DELETE FROM weddings WHERE lower(id) IN ($inClause) OR lower(slug) IN ($inClause)");
            $stmt->execute(array_merge($targetSlugsToDelete, $targetSlugsToDelete));
        }

        // 2. Eliminar físicamente los archivos JSON asociados en data/weddings/
        foreach ($targetSlugsToDelete as $delSlug) {
            $wFile = $base . '/weddings/' . $delSlug . '.json';
            if (file_exists($wFile)) @unlink($wFile);

            $pFile = $base . '/weddingcraft/published/' . $delSlug . '.json';
            if (file_exists($pFile)) @unlink($pFile);

            $fFile = $base . '/floor_plans/' . $delSlug . '.json';
            if (file_exists($fFile)) @unlink($fFile);
        }

        // 3. Actualizar seed.json para remover el evento
        $seedFile = $base . '/seed.json';
        if (file_exists($seedFile)) {
            $seedData = json_decode(@file_get_contents($seedFile), true);
            if (!empty($seedData['weddings']) && is_array($seedData['weddings'])) {
                $seedData['weddings'] = array_values(array_filter($seedData['weddings'], function($w) use ($targetSlugsToDelete) {
                    $wId = strtolower($w['id'] ?? '');
                    $wSlug = strtolower($w['slug'] ?? '');
                    if (in_array($wId, $targetSlugsToDelete, true) || in_array($wSlug, $targetSlugsToDelete, true)) return false;
                    return true;
                }));
                @file_put_contents($seedFile, json_encode($seedData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
        }

        // 4. Remover el evento de los permisos de usuarios
        $usrFile = $base . '/system_users.json';
        if (file_exists($usrFile)) {
            $uData = json_decode(@file_get_contents($usrFile), true);
            if (is_array($uData)) {
                foreach ($uData as &$u) {
                    foreach (['assignedWeddingIds', 'createdWeddingIds'] as $fld) {
                        if (!empty($u[$fld]) && is_array($u[$fld])) {
                            $u[$fld] = array_values(array_filter($u[$fld], function($wid) use ($targetSlugsToDelete) {
                                return !in_array(strtolower($wid), $targetSlugsToDelete, true);
                            }));
                        }
                    }
                }
                unset($u);
                @file_put_contents($usrFile, json_encode($uData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
        }

        sendJson(['success' => true, 'message' => 'Boda eliminada del servidor.']);
    }
    sendJson(['success' => false, 'error' => 'ID requerido.'], 400);
}

<?php
/**
 * Residual Files Cleaner for Casanovia
 * 
 * Escanea el servidor y elimina físicamente todos los archivos residuales,
 * copias temporales, archivos .bak y JSONs huérfanos pertenecientes a
 * eventos que ya fueron eliminados de la base de datos de Casanovia.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/sync_events.php';

function purgeResidualFiles() {
    $pdo = getDB();
    $base = getDataDir();
    ensureSubfolders();

    $report = [
        'success' => true,
        'purgedCount' => 0,
        'purgedFiles' => [],
        'activeEvents' => [],
        'message' => ''
    ];

    // 1. Obtener la lista de IDs/slugs de todos los eventos ACTIVOS válidos
    $activeSlugs = [
        '0919-anaedu',
        '0903-clinicaauna',
        '0320-ariannatomas',
        '1128-erikayemar',
        '0710-lucianamateo',
        '0918-sofiatu',
        '0213-valeriasantiago',
        '0912-zenaidaronny',
        '0919-juanjuana',
        '0110-delecapy'
    ];

    // Desde SQLite
    try {
        $stmt = $pdo->query("SELECT id, slug, couple_names, wedding_date FROM weddings");
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            $cSlug = computeEventSlug($r['couple_names'] ?? $r['id'] ?? '', $r['wedding_date'] ?? '');
            if ($cSlug) $activeSlugs[] = strtolower($cSlug);
            if (!empty($r['id']) && strpos($r['id'], '0101-') !== 0) {
                $activeSlugs[] = strtolower(trim($r['id']));
            }
            if (!empty($r['slug']) && strpos($r['slug'], '0101-') !== 0) {
                $activeSlugs[] = strtolower(trim($r['slug']));
            }
        }
    } catch (Exception $e) {}

    // Desde seed.json (si existe)
    $seedFile = $base . '/seed.json';
    if (file_exists($seedFile)) {
        $seedData = json_decode(@file_get_contents($seedFile), true);
        if (!empty($seedData['weddings'])) {
            foreach ($seedData['weddings'] as $sw) {
                $cSlug = computeEventSlug($sw['coupleNames'] ?? $sw['id'] ?? '', $sw['weddingDate'] ?? '');
                if ($cSlug) $activeSlugs[] = strtolower($cSlug);
                if (!empty($sw['id']) && strpos($sw['id'], '0101-') !== 0) $activeSlugs[] = strtolower(trim($sw['id']));
                if (!empty($sw['slug']) && strpos($sw['slug'], '0101-') !== 0) $activeSlugs[] = strtolower(trim($sw['slug']));
            }
        }
    }

    $activeSlugs = array_values(array_unique(array_filter($activeSlugs)));
    $report['activeEvents'] = $activeSlugs;

    // Nombres de archivos permitidos
    $allowedFiles = array_map(function($slug) { return $slug . '.json'; }, $activeSlugs);

    // 2. Limpiar carpeta data/weddings/
    $weddingFiles = glob($base . '/weddings/*.json');
    foreach ($weddingFiles as $wf) {
        $bName = strtolower(basename($wf));
        $slugWithoutExt = strtolower(basename($wf, '.json'));

        $is0101Prefix = (strpos($slugWithoutExt, '0101-') === 0);

        // Si el archivo es un 0101- y existe una versión canónica activa, o no coincide con ningún slug activo
        if ($is0101Prefix || (!in_array($bName, $allowedFiles, true) && !in_array($slugWithoutExt, $activeSlugs, true))) {
            // Verificar si hay un archivo canónico para este evento
            $cleanName = preg_replace('/^0101[-_]?/i', '', $slugWithoutExt);
            $hasCanonical = false;
            foreach ($activeSlugs as $actSlug) {
                if ($actSlug !== $slugWithoutExt && strpos($actSlug, $cleanName) !== false) {
                    $hasCanonical = true;
                    break;
                }
            }

            if ($is0101Prefix && $hasCanonical) {
                if (@unlink($wf)) {
                    $report['purgedCount']++;
                    $report['purgedFiles'][] = 'data/weddings/' . basename($wf) . ' (duplicado 0101-)';
                }
            } elseif (!in_array($bName, $allowedFiles, true) && !in_array($slugWithoutExt, $activeSlugs, true)) {
                if (@unlink($wf)) {
                    $report['purgedCount']++;
                    $report['purgedFiles'][] = 'data/weddings/' . basename($wf);
                }
            }
        }
    }

    // 3. Limpiar carpeta data/weddingcraft/published/
    $pubFiles = glob($base . '/weddingcraft/published/*.json');
    foreach ($pubFiles as $pf) {
        $bName = strtolower(basename($pf));
        $slugWithoutExt = strtolower(basename($pf, '.json'));

        if (!in_array($bName, $allowedFiles, true) && !in_array($slugWithoutExt, $activeSlugs, true)) {
            if (@unlink($pf)) {
                $report['purgedCount']++;
                $report['purgedFiles'][] = 'data/weddingcraft/published/' . basename($pf);
            }
        }
    }

    // 4. Limpiar carpeta data/floor_plans/
    $fpFiles = glob($base . '/floor_plans/*.json');
    foreach ($fpFiles as $ff) {
        $bName = strtolower(basename($ff));
        if ($bName === 'floor_plans.json') continue; // conservar archivo principal
        $slugWithoutExt = strtolower(basename($ff, '.json'));

        if (!in_array($bName, $allowedFiles, true) && !in_array($slugWithoutExt, $activeSlugs, true)) {
            if (@unlink($ff)) {
                $report['purgedCount']++;
                $report['purgedFiles'][] = 'data/floor_plans/' . basename($ff);
            }
        }
    }

    // Limpiar entradas en floor_plans.json para eventos eliminados
    $fpMain = $base . '/floor_plans/floor_plans.json';
    if (file_exists($fpMain)) {
        $fpData = json_decode(@file_get_contents($fpMain), true) ?: [];
        $cleanedFpData = [];
        $fpChanged = false;

        foreach ($fpData as $k => $v) {
            $kLower = strtolower($k);
            if (in_array($kLower, $activeSlugs, true)) {
                $cleanedFpData[$k] = $v;
            } else {
                $fpChanged = true;
                $report['purgedCount']++;
                $report['purgedFiles'][] = 'floor_plans.json entry: ' . $k;
            }
        }

        if ($fpChanged) {
            @file_put_contents($fpMain, json_encode($cleanedFpData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    }

    // 5. Eliminar archivos temporales (.tmp, .bak, .old) en todo data/
    $tmpFiles = glob($base . '/*/*.{tmp,bak,old,zip,tar,gz}', GLOB_BRACE);
    if (is_array($tmpFiles)) {
        foreach ($tmpFiles as $tf) {
            if (@unlink($tf)) {
                $report['purgedCount']++;
                $report['purgedFiles'][] = str_replace($base . '/', 'data/', $tf);
            }
        }
    }

    // Helper recursive rrmdir
    $rrmdir = function($dir) use (&$rrmdir) {
        if (is_dir($dir)) {
            $objects = scandir($dir);
            foreach ($objects as $object) {
                if ($object != "." && $object != "..") {
                    if (is_dir($dir . "/" . $object) && !is_link($dir . "/" . $object))
                        $rrmdir($dir . "/" . $object);
                    else
                        @unlink($dir . "/" . $object);
                }
            }
            @rmdir($dir);
        }
    };

    // 6. Limpiar carpetas estáticas residuales/antiguas en assets/weddingcraft/
    $legacyAssetsDir = dirname(__DIR__) . '/assets/weddingcraft';
    if (is_dir($legacyAssetsDir)) {
        $dirs = glob($legacyAssetsDir . '/*', GLOB_ONLYDIR);
        if (is_array($dirs)) {
            foreach ($dirs as $d) {
                $folderName = strtolower(basename($d));
                // Si no coincide con un evento activo, o si es un duplicado estático antiguo
                if (!in_array($folderName, $activeSlugs, true)) {
                    $rrmdir($d);
                    $report['purgedCount']++;
                    $report['purgedFiles'][] = 'assets/weddingcraft/' . basename($d) . ' (directorio estático residual)';
                }
            }
        }
    }

    // 6. Ejecutar también una consolidación para asegurar consistencia
    syncAllEventsAndLinks();

    $report['message'] = $report['purgedCount'] > 0 
        ? "Se eliminaron exitosamente {$report['purgedCount']} archivos y registros residuales de eventos borrados."
        : "Tu hosting ya se encuentra limpio y optimizado. No se encontraron archivos residuales de eventos borrados.";

    return $report;
}

// Ejecución HTTP
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'clean_residuals.php') {
    $res = purgeResidualFiles();
    sendJson($res);
}

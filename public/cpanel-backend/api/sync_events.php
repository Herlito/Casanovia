<?php
/**
 * Event Links & Design Sync Utility for Casanovia
 * 
 * Revisa todos los eventos en la base de datos (SQLite, JSON y seed.json),
 * consolida todos los datos bajo el nuevo formato único de slug sin "y" (MMDD-nombreevento),
 * elimina IDs antiguos, limpia registros duplicados y purga archivos obsoletos
 * para evitar la acumulación de basura en el hosting.
 */

require_once __DIR__ . '/db.php';

function syncAllEventsAndLinks() {
    $pdo = getDB();
    $base = getDataDir();
    ensureSubfolders();

    $report = [
        'processed' => 0,
        'unique_weddings' => 0,
        'synced_designs' => 0,
        'purged_files' => 0,
        'events' => []
    ];

    // 1. Recolectar todas las bodas existentes de SQLite, archivos JSON y seed.json
    $rawEntries = [];

    // SQLite
    try {
        $stmt = $pdo->query("SELECT * FROM weddings");
        $rows = $stmt->fetchAll();
        foreach ($rows as $r) {
            $parsed = json_decode($r['wedding_data_json'] ?? '{}', true) ?: [];
            if (!empty($parsed)) {
                $rawEntries[] = $parsed;
            } elseif (!empty($r['id'])) {
                $rawEntries[] = [
                    'id' => $r['id'],
                    'coupleNames' => $r['couple_names'],
                    'weddingDate' => $r['wedding_date'],
                    'title' => $r['title'],
                    'slug' => $r['slug']
                ];
            }
        }
    } catch (Exception $e) {}

    // Archivos JSON en data/weddings/
    $jsonFiles = glob($base . '/weddings/*.json');
    foreach ($jsonFiles as $jf) {
        $wData = json_decode(@file_get_contents($jf), true);
        if ($wData && !empty($wData['id'])) {
            $rawEntries[] = $wData;
        }
    }

    // seed.json
    $seedFile = $base . '/seed.json';
    if (file_exists($seedFile)) {
        $seedData = json_decode(@file_get_contents($seedFile), true);
        if (!empty($seedData['weddings'])) {
            foreach ($seedData['weddings'] as $sw) {
                if (!empty($sw['id'])) {
                    $rawEntries[] = $sw;
                }
            }
        }
    }

    // Recolectar también diseños publicados de weddingcraft_designs y data/weddingcraft/published/
    $designMap = [];

    try {
        $stD = $pdo->query("SELECT * FROM weddingcraft_designs");
        foreach ($stD->fetchAll() as $dr) {
            $dObj = json_decode($dr['document_json'] ?? '{}', true);
            if ($dObj && (!empty($dObj['pages'][0]['elements']) || !empty($dObj['elements']))) {
                $key = $dr['wedding_id'] ?? $dr['id'];
                $designMap[$key] = $dObj;
            }
        }
    } catch (Exception $e) {}

    $pubFiles = glob($base . '/weddingcraft/published/*.json');
    foreach ($pubFiles as $pf) {
        $basePf = basename($pf, '.json');
        $pContent = json_decode(@file_get_contents($pf), true);
        if ($pContent) {
            $doc = $pContent['design']['document'] ?? $pContent['document'] ?? $pContent;
            if ($doc && (!empty($doc['pages'][0]['elements']) || !empty($doc['elements']))) {
                $designMap[$basePf] = $doc;
            }
        }
    }

    // 2. Agrupar todas las bodas por su slug canónico sin "y" (ej: 0919-anaedu, 0110-delecapy)
    $groupedWeddings = [];

    foreach ($rawEntries as $entry) {
        $canonicalSlug = computeEventSlug($entry);

        if (!isset($groupedWeddings[$canonicalSlug])) {
            $groupedWeddings[$canonicalSlug] = [
                'canonicalSlug' => $canonicalSlug,
                'entries' => [],
                'designs' => []
            ];
        }

        $groupedWeddings[$canonicalSlug]['entries'][] = $entry;

        // Si esta entrada o sus IDs antiguos tenían un diseño registrado, asociarlo
        $oldId = $entry['id'] ?? '';
        $oldSlug = $entry['slug'] ?? '';
        if (!empty($entry['weddingCraftDesign'])) {
            $groupedWeddings[$canonicalSlug]['designs'][] = $entry['weddingCraftDesign'];
        }
        if (!empty($designMap[$oldId])) {
            $groupedWeddings[$canonicalSlug]['designs'][] = $designMap[$oldId];
        }
        if (!empty($designMap[$oldSlug])) {
            $groupedWeddings[$canonicalSlug]['designs'][] = $designMap[$oldSlug];
        }
        if (!empty($designMap[$canonicalSlug])) {
            $groupedWeddings[$canonicalSlug]['designs'][] = $designMap[$canonicalSlug];
        }
    }

    // 3. Consolidar cada grupo en un ÚNICO objeto de boda canónico
    $canonicalWeddings = [];
    $canonicalDesigns = [];

    foreach ($groupedWeddings as $canonicalSlug => $group) {
        $mergedWedding = null;

        // Seleccionar la entrada con más datos (invitados, plano de mesas, etc.)
        usort($group['entries'], function($a, $b) {
            $scoreA = count($a['guests'] ?? []) * 10 + count($a['tables'] ?? []) * 5 + (!empty($a['weddingCraftDesign']) ? 50 : 0);
            $scoreB = count($b['guests'] ?? []) * 10 + count($b['tables'] ?? []) * 5 + (!empty($b['weddingCraftDesign']) ? 50 : 0);
            return $scoreB <=> $scoreA;
        });

        $mergedWedding = $group['entries'][0];
        $mergedWedding['id'] = $canonicalSlug;
        $mergedWedding['slug'] = $canonicalSlug;

        // Combinar exhaustivamente invitados, planos de mesa, cronogramas, presupuestos, tareas y proveedores
        $allGuests = [];
        $allTables = [];
        $allTimeline = [];
        $allBudget = [];
        $allTasks = [];
        $allVendors = [];

        foreach ($group['entries'] as $entry) {
            // Invitados
            if (!empty($entry['guests']) && is_array($entry['guests'])) {
                foreach ($entry['guests'] as $g) {
                    $gKey = $g['id'] ?? $g['code'] ?? ($g['fullName'] ?? '');
                    if ($gKey && !isset($allGuests[$gKey])) {
                        $allGuests[$gKey] = $g;
                    }
                }
            }
            // Tablas / Planos de distribucion
            if (!empty($entry['tables']) && is_array($entry['tables'])) {
                foreach ($entry['tables'] as $tb) {
                    $tbKey = $tb['id'] ?? $tb['name'] ?? '';
                    if ($tbKey && !isset($allTables[$tbKey])) {
                        $allTables[$tbKey] = $tb;
                    }
                }
            }
            // Cronograma
            if (!empty($entry['timeline']) && is_array($entry['timeline'])) {
                foreach ($entry['timeline'] as $tm) {
                    $tmKey = $tm['id'] ?? $tm['title'] ?? '';
                    if ($tmKey && !isset($allTimeline[$tmKey])) {
                        $allTimeline[$tmKey] = $tm;
                    }
                }
            }
            // Presupuesto
            if (!empty($entry['budget']) && is_array($entry['budget'])) {
                foreach ($entry['budget'] as $bg) {
                    $bgKey = $bg['id'] ?? $bg['category'] ?? '';
                    if ($bgKey && !isset($allBudget[$bgKey])) {
                        $allBudget[$bgKey] = $bg;
                    }
                }
            }
            // Tareas
            if (!empty($entry['tasks']) && is_array($entry['tasks'])) {
                foreach ($entry['tasks'] as $tk) {
                    $tkKey = $tk['id'] ?? $tk['title'] ?? '';
                    if ($tkKey && !isset($allTasks[$tkKey])) {
                        $allTasks[$tkKey] = $tk;
                    }
                }
            }
            // Proveedores
            if (!empty($entry['vendors']) && is_array($entry['vendors'])) {
                foreach ($entry['vendors'] as $vd) {
                    $vdKey = $vd['id'] ?? $vd['name'] ?? '';
                    if ($vdKey && !isset($allVendors[$vdKey])) {
                        $allVendors[$vdKey] = $vd;
                    }
                }
            }
        }

        if (!empty($allGuests)) $mergedWedding['guests'] = array_values($allGuests);
        if (!empty($allTables)) $mergedWedding['tables'] = array_values($allTables);
        if (!empty($allTimeline)) $mergedWedding['timeline'] = array_values($allTimeline);
        if (!empty($allBudget)) $mergedWedding['budget'] = array_values($allBudget);
        if (!empty($allTasks)) $mergedWedding['tasks'] = array_values($allTasks);
        if (!empty($allVendors)) $mergedWedding['vendors'] = array_values($allVendors);

        // Seleccionar el mejor diseño disponible para esta boda
        $bestDesign = null;
        if (!empty($group['designs'])) {
            foreach ($group['designs'] as $des) {
                if ($des && (!empty($des['pages'][0]['elements']) || !empty($des['elements']))) {
                    $bestDesign = $des;
                    break;
                }
            }
        }

        if ($bestDesign) {
            $bestDesign['metadata']['weddingId'] = $canonicalSlug;
            $mergedWedding['weddingCraftDesign'] = $bestDesign;
            $canonicalDesigns[$canonicalSlug] = $bestDesign;
        }

        $canonicalWeddings[$canonicalSlug] = $mergedWedding;
    }

    // 4. PURGA Y LIMPIEZA DE BASE DE DATOS SQLITE (Eliminar registros antiguos / duplicados)
    try {
        $pdo->exec("DELETE FROM weddings");
        $pdo->exec("DELETE FROM weddingcraft_designs");

        $stW = $pdo->prepare("INSERT INTO weddings (id, user_id, title, couple_names, slug, wedding_date, wedding_data_json, is_active, updated_at) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)");
        $stD = $pdo->prepare("INSERT INTO weddingcraft_designs (id, wedding_id, document_json, is_published, updated_at)
                              VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)");

        foreach ($canonicalWeddings as $slug => $wObj) {
            $wJson = json_encode($wObj, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            $stW->execute([
                $slug,
                $wObj['createdByUserId'] ?? $wObj['userId'] ?? 'user-herly',
                $wObj['coupleNames'] ?? $wObj['title'] ?? 'Boda',
                $wObj['coupleNames'] ?? '',
                $slug,
                $wObj['weddingDate'] ?? date('Y-m-d'),
                $wJson
            ]);

            if (!empty($wObj['weddingCraftDesign'])) {
                $dJson = json_encode($wObj['weddingCraftDesign'], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
                $stD->execute([$slug, $slug, $dJson]);
                $report['synced_designs']++;
            }
        }
    } catch (Exception $e) {}

    // 5. PURGA Y LIMPIEZA DE ARCHIVOS EN DISCO
    $allowedFileNames = array_map(function($slug) { return $slug . '.json'; }, array_keys($canonicalWeddings));

    // Limpiar data/weddings/
    $currentWeddingFiles = glob($base . '/weddings/*.json');
    foreach ($currentWeddingFiles as $wf) {
        $bName = basename($wf);
        if (!in_array($bName, $allowedFileNames, true)) {
            @unlink($wf);
            $report['purged_files']++;
        }
    }

    // Limpiar data/weddingcraft/published/
    $currentPubFiles = glob($base . '/weddingcraft/published/*.json');
    foreach ($currentPubFiles as $pf) {
        $bName = basename($pf);
        if (!in_array($bName, $allowedFileNames, true)) {
            @unlink($pf);
            $report['purged_files']++;
        }
    }

    // Escribir únicamente los archivos canónicos limpios
    foreach ($canonicalWeddings as $slug => $wObj) {
        $wPath = $base . '/weddings/' . $slug . '.json';
        @file_put_contents($wPath, json_encode($wObj, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        if (!empty($wObj['weddingCraftDesign'])) {
            $pPath = $base . '/weddingcraft/published/' . $slug . '.json';
            $pubPayload = [
                'success' => true,
                'design' => [
                    'id' => $slug,
                    'wedding_id' => $slug,
                    'is_published' => 1,
                    'document' => $wObj['weddingCraftDesign'],
                    'updated_at' => date('c')
                ]
            ];
            @file_put_contents($pPath, json_encode($pubPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }
    }

    // 6. Migrar floor_plans.json y system_users.json si existen
    $fpFile = $base . '/floor_plans/floor_plans.json';
    if (file_exists($fpFile)) {
        $fpData = json_decode(@file_get_contents($fpFile), true) ?: [];
        $newFpData = [];
        foreach ($fpData as $oldKey => $val) {
            if (is_array($val)) {
                $cSlug = computeEventSlug($val['coupleNames'] ?? $val['title'] ?? '', $val['weddingDate'] ?? null);
                if (isset($canonicalWeddings[$cSlug])) {
                    $val['weddingId'] = $cSlug;
                    $newFpData[$cSlug] = $val;
                }
            }
        }
        @file_put_contents($fpFile, json_encode($newFpData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    $usrFile = $base . '/users/system_users.json';
    $existingUsers = [];

    // 1. Leer usuarios de SQLite
    try {
        $uStmt = $pdo->query("SELECT * FROM users");
        foreach ($uStmt->fetchAll() as $uRow) {
            $uId = $uRow['id'];
            $existingUsers[$uId] = [
                'id' => $uRow['id'],
                'username' => $uRow['username'],
                'clave' => $uRow['clave'],
                'level' => intval($uRow['level']),
                'roleTitle' => $uRow['role_title'],
                'assignedWeddingIds' => json_decode($uRow['assigned_wedding_ids'] ?? '[]', true) ?: [],
                'createdWeddingIds' => json_decode($uRow['created_wedding_ids'] ?? '[]', true) ?: [],
                'isSystemDefault' => (bool)$uRow['is_system_default'],
                'createdAt' => $uRow['created_at'] ?? date('c')
            ];
        }
    } catch (Exception $e) {}

    // 2. Leer usuarios de system_users.json
    if (file_exists($usrFile)) {
        $rawUsr = json_decode(@file_get_contents($usrFile), true) ?: [];
        $usrList = isset($rawUsr['users']) ? $rawUsr['users'] : (is_array($rawUsr) ? $rawUsr : []);
        foreach ($usrList as $uObj) {
            if (!empty($uObj['id']) || !empty($uObj['username'])) {
                $uKey = $uObj['id'] ?? $uObj['username'];
                if (!isset($existingUsers[$uKey])) {
                    $existingUsers[$uKey] = $uObj;
                } else {
                    $existingUsers[$uKey] = array_merge($existingUsers[$uKey], array_filter($uObj));
                }
            }
        }
    }

    // 3. Traducir IDs de bodas asignadas y creadas a los nuevos slugs canónicos sin borrar nada
    foreach ($existingUsers as &$u) {
        foreach (['assignedWeddingIds', 'createdWeddingIds'] as $field) {
            if (!empty($u[$field]) && is_array($u[$field])) {
                $newSlugs = [];
                foreach ($u[$field] as $oldWId) {
                    $mapped = computeEventSlug($oldWId);
                    if (isset($canonicalWeddings[$mapped])) {
                        $newSlugs[] = $mapped;
                    } else {
                        $newSlugs[] = $oldWId;
                    }
                }
                $u[$field] = array_values(array_unique($newSlugs));
            }
        }
    }
    unset($u);

    // 4. Guardar lista completa de usuarios en system_users.json
    $finalUsersList = array_values($existingUsers);
    @file_put_contents($usrFile, json_encode($finalUsersList, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // 5. Sincronizar usuarios en la tabla SQLite de users
    try {
        $stU = $pdo->prepare("INSERT OR REPLACE INTO users (id, username, clave, level, role_title, assigned_wedding_ids, created_wedding_ids, is_system_default, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        foreach ($finalUsersList as $u) {
            $stU->execute([
                $u['id'] ?? uniqid('usr_'),
                $u['username'] ?? '',
                $u['clave'] ?? '',
                $u['level'] ?? 2,
                $u['roleTitle'] ?? '',
                json_encode($u['assignedWeddingIds'] ?? []),
                json_encode($u['createdWeddingIds'] ?? []),
                !empty($u['isSystemDefault']) ? 1 : 0
            ]);
        }
    } catch (Exception $e) {}

    // 7. Escribir un seed.json limpio y único sin duplicados
    $seedPayload = [
        'weddings' => array_values($canonicalWeddings),
        'publishedDesigns' => $canonicalDesigns,
        'updatedAt' => date('c')
    ];
    @file_put_contents($seedFile, json_encode($seedPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    $report['unique_weddings'] = count($canonicalWeddings);
    $report['processed'] = count($rawEntries);
    foreach ($canonicalWeddings as $slug => $wObj) {
        $report['events'][] = [
            'id' => $slug,
            'coupleNames' => $wObj['coupleNames'] ?? '',
            'weddingDate' => $wObj['weddingDate'] ?? '',
            'slug' => $slug,
            'hasDesign' => !empty($wObj['weddingCraftDesign'])
        ];
    }

    return $report;
}

// Ejecución directa por API
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'sync_events.php') {
    $res = syncAllEventsAndLinks();
    sendJson([
        'success' => true,
        'message' => 'Consolidación completada: Todos los eventos migraron al formato único de slug sin "y" y se eliminó la basura/duplicados.',
        'report' => $res
    ]);
}

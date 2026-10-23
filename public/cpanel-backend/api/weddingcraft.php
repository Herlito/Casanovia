<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? $_POST['action'] ?? null;
$base = getDataDir();

/**
 * Normaliza cualquier ruta de imagen a una URL absoluta completa en casanovia.pe
 */
function makeAbsoluteImageUrl($url, $domain = null) {
    if (empty($url) || !is_string($url)) return '';
    $trimmed = trim($url);
    if (empty($trimmed)) return '';

    // Si es Base64 o Blob, se mantiene tal cual
    if (strpos($trimmed, 'data:image/') === 0 || strpos($trimmed, 'blob:') === 0) {
        return $trimmed;
    }

    // Determinar dominio base
    if (!$domain) {
        $host = $_SERVER['HTTP_HOST'] ?? 'www.casanovia.pe';
        if ($host === 'localhost' || strpos($host, '127.0.0.1') !== false || strpos($host, '3000') !== false) {
            $domain = 'https://www.casanovia.pe';
        } else {
            $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
            $domain = $scheme . '://' . $host;
        }
    }

    // Si ya es URL absoluta HTTP/HTTPS
    if (strpos($trimmed, 'http://') === 0 || strpos($trimmed, 'https://') === 0) {
        if (preg_match('/http:\/\/(localhost:3000|127\.0\.0\.1:\d+)\/?/', $trimmed)) {
            return preg_replace('/http:\/\/(localhost:3000|127\.0\.0\.1:\d+)\/?/', rtrim($domain, '/') . '/', $trimmed);
        }
        return $trimmed;
    }

    // Rutas relativas
    $cleanPath = preg_replace('/^(\.\/|\.\.\/)+/', '', $trimmed);
    if (strpos($cleanPath, 'cpanel-backend/uploads/') !== false) {
        $cleanPath = preg_replace('/.*cpanel-backend\/uploads\//', 'uploads/', $cleanPath);
    }
    if (strpos($cleanPath, '/') !== 0) {
        $cleanPath = '/' . $cleanPath;
    }

    return rtrim($domain, '/') . $cleanPath;
}

/**
 * Recorre recursivamente la estructura del documento JSON y convierte todas las URLs de imágenes a absolutas
 */
function processDocumentImages(&$data, $domain = null) {
    if (!is_array($data)) return;

    foreach ($data as $key => &$value) {
        if (is_array($value)) {
            processDocumentImages($value, $domain);
        } elseif (is_string($value)) {
            if (in_array($key, ['backgroundImage', 'webBackgroundImage', 'src', 'imageSrc', 'url', 'imageUrl', 'avatarUrl', 'thumbnailUrl', 'backgroundUrl'], true)) {
                $value = makeAbsoluteImageUrl($value, $domain);
            }
        }
    }
}

if ($method === 'GET') {
    // 1. Listar plantillas de WeddingCraft
    if ($action === 'list_templates' || $action === 'templates') {
        $stmt = $pdo->query("SELECT * FROM weddingcraft_templates ORDER BY updated_at DESC");
        $rows = $stmt->fetchAll();
        $templates = [];
        foreach ($rows as $r) {
            $parsed = json_decode($r['template_json'], true);
            if ($parsed) {
                processDocumentImages($parsed);
                $templates[] = $parsed;
            }
        }

        if (empty($templates)) {
            $tplDir = $base . '/weddingcraft/templates';
            if (is_dir($tplDir)) {
                $files = glob($tplDir . '/*.json');
                foreach ($files as $f) {
                    $content = @file_get_contents($f);
                    $t = @json_decode($content, true);
                    if ($t) {
                        processDocumentImages($t);
                        $templates[] = $t;
                    }
                }
            }
        }
        sendJson(['success' => true, 'templates' => $templates]);
    }

    // 2. Listar biblioteca de objetos de WeddingCraft
    if ($action === 'list_library' || $action === 'library') {
        $stmt = $pdo->query("SELECT * FROM weddingcraft_library ORDER BY created_at DESC");
        $rows = $stmt->fetchAll();
        $items = [];
        foreach ($rows as $r) {
            $el = json_decode($r['element_json'], true);
            if ($el) processDocumentImages($el);
            $items[] = [
                'id' => $r['id'],
                'templateName' => $r['template_name'],
                'savedBy' => $r['saved_by'],
                'createdAt' => strtotime($r['created_at']) * 1000,
                'element' => $el
            ];
        }

        if (empty($items)) {
            $libFile = $base . '/weddingcraft/library/library_items.json';
            if (file_exists($libFile)) {
                $content = @file_get_contents($libFile);
                $items = @json_decode($content, true) ?: [];
                foreach ($items as &$it) {
                    if (isset($it['element'])) processDocumentImages($it['element']);
                }
            }
        }
        sendJson(['success' => true, 'items' => $items]);
    }

    // 3. Obtener diseño publicado o borrador de una boda
    $weddingId = $_GET['wedding_id'] ?? $_GET['weddingId'] ?? $_GET['slug'] ?? null;
    $publishedOnly = !empty($_GET['published']);

    if ($weddingId) {
        $cleanId = preg_replace('/^(\d{4}-|boda-|wedding-)/i', '', $weddingId);
        $cleanIdNoSuffix = preg_replace('/[-_]\d+$/i', '', $cleanId);
        
        // Extraer nombres clave para búsqueda tolerante (ej: juan, juana)
        $parts = preg_split('/[-_yY\s]+/', $cleanIdNoSuffix);
        $parts = array_values(array_filter($parts, function($p) { return strlen($p) >= 3; }));
        $name1 = $parts[0] ?? '';
        $name2 = $parts[1] ?? '';

        // A. Buscar primero en base de datos SQLite (Publicado o el más reciente)
        $sql = "SELECT * FROM weddingcraft_designs WHERE (
                    wedding_id = ? 
                    OR wedding_id LIKE ? 
                    OR wedding_id LIKE ? 
                    OR (? != '' AND ? != '' AND wedding_id LIKE ? AND wedding_id LIKE ?)
                ) " . ($publishedOnly ? "AND is_published = 1 " : "") . "ORDER BY is_published DESC, updated_at DESC LIMIT 1";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            $weddingId, 
            '%' . $cleanId . '%', 
            '%' . $cleanIdNoSuffix . '%',
            $name1,
            $name2,
            '%' . $name1 . '%',
            '%' . $name2 . '%'
        ]);
        $row = $stmt->fetch();

        if ($row) {
            $doc = json_decode($row['document_json'], true);
            if ($doc) {
                processDocumentImages($doc);
                $row['document'] = $doc;
                unset($row['document_json']);
                sendJson(['success' => true, 'design' => $row]);
            }
        }

        // B. Buscar en archivo JSON individual de la boda en data/weddingcraft/published/
        $candidateFiles = [
            $weddingId,
            $cleanId,
            $cleanIdNoSuffix,
            'boda-' . $cleanId,
            'boda-' . $cleanIdNoSuffix
        ];

        if (!empty($name1) && !empty($name2)) {
            $candidateFiles[] = $name1 . '-' . $name2;
            $candidateFiles[] = $name1 . 'y' . $name2;
            $candidateFiles[] = 'boda-' . $name1 . '-' . $name2;
        }

        foreach (array_unique($candidateFiles) as $cfId) {
            $jsonPath = $base . '/weddingcraft/published/' . $cfId . '.json';
            if (file_exists($jsonPath) && filesize($jsonPath) > 5) {
                $doc = json_decode(file_get_contents($jsonPath), true);
                if ($doc) {
                    if (isset($doc['design']['document'])) {
                        $doc = $doc['design']['document'];
                    } elseif (isset($doc['document'])) {
                        $doc = $doc['document'];
                    }
                    processDocumentImages($doc);
                    sendJson(['success' => true, 'design' => [
                        'id' => 'file_' . $cfId,
                        'wedding_id' => $weddingId,
                        'is_published' => 1,
                        'document' => $doc
                    ]]);
                }
            }
        }

        // B.2 Escanear todos los archivos en data/weddingcraft/published/ si hay coincidencia de nombres
        $pubDir = $base . '/weddingcraft/published';
        if (is_dir($pubDir) && !empty($name1)) {
            $pubFiles = glob($pubDir . '/*.json');
            foreach ($pubFiles as $pf) {
                $basePf = basename($pf, '.json');
                if (stripos($basePf, $name1) !== false && (empty($name2) || stripos($basePf, $name2) !== false)) {
                    $doc = json_decode(@file_get_contents($pf), true);
                    if ($doc) {
                        if (isset($doc['design']['document'])) {
                            $doc = $doc['design']['document'];
                        } elseif (isset($doc['document'])) {
                            $doc = $doc['document'];
                        }
                        processDocumentImages($doc);
                        sendJson(['success' => true, 'design' => [
                            'id' => 'file_' . $basePf,
                            'wedding_id' => $weddingId,
                            'is_published' => 1,
                            'document' => $doc
                        ]]);
                    }
                }
            }
        }

        // C. Buscar en seed.json
        $seedFile = $base . '/seed.json';
        if (file_exists($seedFile)) {
            $seedData = json_decode(file_get_contents($seedFile), true);
            foreach (array_unique($candidateFiles) as $cfId) {
                if (!empty($seedData['publishedDesigns'][$cfId])) {
                    $doc = $seedData['publishedDesigns'][$cfId];
                    processDocumentImages($doc);
                    sendJson(['success' => true, 'design' => [
                        'id' => 'seed_' . $cfId,
                        'wedding_id' => $weddingId,
                        'is_published' => 1,
                        'document' => $doc
                    ]]);
                }
            }

            // Búsqueda en publishedDesigns de seed.json por nombres
            if (!empty($seedData['publishedDesigns']) && !empty($name1)) {
                foreach ($seedData['publishedDesigns'] as $k => $doc) {
                    if (stripos($k, $name1) !== false && (empty($name2) || stripos($k, $name2) !== false)) {
                        processDocumentImages($doc);
                        sendJson(['success' => true, 'design' => [
                            'id' => 'seed_' . $k,
                            'wedding_id' => $weddingId,
                            'is_published' => 1,
                            'document' => $doc
                        ]]);
                    }
                }
            }
        }

        // D. Buscar si la boda existe en la tabla weddings de SQLite y tiene un diseño weddingCraftDesign integrado
        try {
            $stmtWed = $pdo->prepare("SELECT wedding_data_json FROM weddings WHERE id = ? OR slug = ? OR id LIKE ? OR couple_names LIKE ? OR (? != '' AND ? != '' AND (id LIKE ? OR couple_names LIKE ?) AND (id LIKE ? OR couple_names LIKE ?)) LIMIT 1");
            $stmtWed->execute([
                $weddingId,
                $weddingId,
                '%' . $cleanId . '%',
                '%' . $cleanId . '%',
                $name1,
                $name2,
                '%' . $name1 . '%',
                '%' . $name1 . '%',
                '%' . $name2 . '%',
                '%' . $name2 . '%'
            ]);
            $wRow = $stmtWed->fetch();
            if ($wRow) {
                $wData = json_decode($wRow['wedding_data_json'] ?? '{}', true) ?: [];
                $wDesign = $wData['weddingCraftDesign'] ?? $wData['publishedDesign'] ?? null;
                if ($wDesign && (!empty($wDesign['pages'][0]['elements']) || !empty($wDesign['elements']))) {
                    processDocumentImages($wDesign);
                    sendJson(['success' => true, 'design' => [
                        'id' => 'wed_' . ($wData['id'] ?? $weddingId),
                        'wedding_id' => $weddingId,
                        'is_published' => 1,
                        'document' => $wDesign
                    ]]);
                }
            }
        } catch (Exception $e) {}

        sendJson(['success' => false, 'error' => 'No hay diseño guardado para esta boda.'], 404);
    }

    sendJson(['success' => false, 'error' => 'Parámetro requerido.'], 400);
}

if ($method === 'POST') {
    $body = getBody();
    $postAction = $body['action'] ?? $action;

    // 1. Guardar plantilla en el hosting
    if ($postAction === 'save_template') {
        $template = $body['template'] ?? $body;
        $id = $template['id'] ?? uniqid('tpl_');
        $name = $template['name'] ?? 'Nueva Plantilla';
        $author = $template['author'] ?? 'WeddingCraft';
        
        processDocumentImages($template);
        $templateJson = json_encode($template, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        try {
            $stmt = $pdo->prepare("INSERT INTO weddingcraft_templates (id, name, author, template_json, updated_at) 
                                   VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                                   ON CONFLICT(id) DO UPDATE SET 
                                   name=excluded.name, 
                                   author=excluded.author, 
                                   template_json=excluded.template_json, 
                                   updated_at=CURRENT_TIMESTAMP");
            $stmt->execute([$id, $name, $author, $templateJson]);
        } catch (Exception $e) {
            $stmtFallback = $pdo->prepare("REPLACE INTO weddingcraft_templates (id, name, author, template_json) VALUES (?, ?, ?, ?)");
            $stmtFallback->execute([$id, $name, $author, $templateJson]);
        }

        $tplPath = $base . '/weddingcraft/templates/' . $id . '.json';
        @file_put_contents($tplPath, $templateJson);

        sendJson(['success' => true, 'id' => $id, 'message' => 'Plantilla guardada exitosamente en tu hosting.']);
    }

    // 2. Guardar objeto en biblioteca de WeddingCraft en el hosting
    if ($postAction === 'save_library') {
        $item = $body['item'] ?? $body;
        $id = $item['id'] ?? uniqid('lib_');
        $templateName = $item['templateName'] ?? 'General';
        $savedBy = $item['savedBy'] ?? 'WeddingCraft Studio';
        $element = $item['element'] ?? $item;
        
        processDocumentImages($element);
        $elementJson = json_encode($element, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

        $stmt = $pdo->prepare("INSERT OR REPLACE INTO weddingcraft_library (id, template_name, element_json, saved_by) VALUES (?, ?, ?, ?)");
        $stmt->execute([$id, $templateName, $elementJson, $savedBy]);

        $libFile = $base . '/weddingcraft/library/library_items.json';
        $existing = [];
        if (file_exists($libFile)) {
            $existing = json_decode(file_get_contents($libFile), true) ?: [];
        }
        $existing = array_values(array_filter($existing, function($i) use ($id) { return ($i['id'] ?? '') !== $id; }));
        array_unshift($existing, [
            'id' => $id,
            'templateName' => $templateName,
            'savedBy' => $savedBy,
            'createdAt' => time() * 1000,
            'element' => json_decode($elementJson, true)
        ]);
        @file_put_contents($libFile, json_encode($existing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

        sendJson(['success' => true, 'id' => $id, 'message' => 'Objeto guardado en biblioteca en tu hosting.']);
    }

    // 3. Guardar diseño publicado o borrador de boda en el hosting
    $rawWeddingId = $body['weddingId'] ?? $body['wedding_id'] ?? '';
    $document = $body['document'] ?? $body;
    
    // Resolve canonical slug for this wedding
    $canonicalSlug = $rawWeddingId;
    if ($rawWeddingId) {
        try {
            $stW = $pdo->prepare("SELECT couple_names, wedding_date, slug FROM weddings WHERE id = ? OR slug = ? LIMIT 1");
            $stW->execute([$rawWeddingId, $rawWeddingId]);
            $wRow = $stW->fetch();
            if ($wRow) {
                $canonicalSlug = computeEventSlug($wRow['couple_names'], $wRow['wedding_date']);
            } else {
                $canonicalSlug = computeEventSlug($rawWeddingId, null);
            }
        } catch (Exception $e) {
            $canonicalSlug = computeEventSlug($rawWeddingId, null);
        }
    }
    if (!$canonicalSlug) $canonicalSlug = 'evento';

    if (isset($document['metadata'])) {
        $document['metadata']['weddingId'] = $canonicalSlug;
    }

    // Convertir URLs internas a absolutas antes de persistir
    processDocumentImages($document);
    $documentJson = json_encode($document, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    $isPublished = (!empty($body['isPublished']) || !empty($body['is_published']) || $action === 'publish') ? 1 : 0;

    try {
        $stmt = $pdo->prepare("INSERT INTO weddingcraft_designs (id, wedding_id, document_json, is_published, updated_at) 
                               VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                               ON CONFLICT(id) DO UPDATE SET
                               wedding_id=excluded.wedding_id,
                               document_json=excluded.document_json,
                               is_published=excluded.is_published,
                               updated_at=CURRENT_TIMESTAMP");
        $stmt->execute([$canonicalSlug, $canonicalSlug, $documentJson, $isPublished]);
    } catch (Exception $e) {
        $stmtFallback = $pdo->prepare("REPLACE INTO weddingcraft_designs (id, wedding_id, document_json, is_published) VALUES (?, ?, ?, ?)");
        $stmtFallback->execute([$canonicalSlug, $canonicalSlug, $documentJson, $isPublished]);
    }

    // Write file ONLY to data/weddingcraft/published/{canonicalSlug}.json
    $pubPath = $base . '/weddingcraft/published/' . $canonicalSlug . '.json';
    $pubPayload = [
        'success' => true,
        'design' => [
            'id' => $canonicalSlug,
            'wedding_id' => $canonicalSlug,
            'is_published' => $isPublished,
            'document' => $document,
            'updated_at' => date('c')
        ]
    ];
    @file_put_contents($pubPath, json_encode($pubPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    // Also update seed.json cleanly
    $seedFile = $base . '/seed.json';
    if (file_exists($seedFile)) {
        $seedData = json_decode(@file_get_contents($seedFile), true) ?: [];
        if (!isset($seedData['publishedDesigns'])) {
            $seedData['publishedDesigns'] = [];
        }
        $seedData['publishedDesigns'][$canonicalSlug] = $document;
        @file_put_contents($seedFile, json_encode($seedData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }

    sendJson(['success' => true, 'id' => $canonicalSlug, 'wedding_id' => $canonicalSlug, 'message' => 'Diseño guardado exitosamente en tu hosting.']);
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    $type = $_GET['type'] ?? 'design';

    if ($type === 'template' && $id) {
        $stmt = $pdo->prepare("DELETE FROM weddingcraft_templates WHERE id = ?");
        $stmt->execute([$id]);
        $tplPath = $base . '/weddingcraft/templates/' . $id . '.json';
        if (file_exists($tplPath)) @unlink($tplPath);
        sendJson(['success' => true, 'message' => 'Plantilla eliminada.']);
    }

    if ($type === 'library' && $id) {
        $stmt = $pdo->prepare("DELETE FROM weddingcraft_library WHERE id = ?");
        $stmt->execute([$id]);
        $libFile = $base . '/weddingcraft/library/library_items.json';
        if (file_exists($libFile)) {
            $existing = json_decode(file_get_contents($libFile), true) ?: [];
            $existing = array_values(array_filter($existing, function($i) use ($id) { return ($i['id'] ?? '') !== $id; }));
            @file_put_contents($libFile, json_encode($existing, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        }
        sendJson(['success' => true, 'message' => 'Objeto de biblioteca eliminado.']);
    }

    sendJson(['success' => false, 'error' => 'Parámetros inválidos.'], 400);
}

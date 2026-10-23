<?php
/**
 * Casanovia Seed Provider Endpoint
 * Permite al frontend obtener la semilla completa de bodas y diseños sin ser bloqueado por .htaccess de api/data/
 */
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$seedPaths = [
    __DIR__ . '/data/seed.json',
    __DIR__ . '/../casanovia_database_seed.json',
    dirname(__DIR__) . '/casanovia_database_seed.json',
    dirname(__DIR__, 2) . '/src/data/firestoreWeddingsSeed.json'
];

foreach ($seedPaths as $path) {
    if (file_exists($path)) {
        $content = file_get_contents($path);
        if (!empty($content)) {
            echo $content;
            exit;
        }
    }
}

// Fallback mínimo si no existe archivo de semilla físico
echo json_encode([
    'casanoviaVersion' => '3.0.0-complete-suite',
    'weddings' => [],
    'publishedDesigns' => new stdClass(),
    'message' => 'Sin archivo de semilla local disponible.'
], JSON_UNESCAPED_UNICODE);
exit;

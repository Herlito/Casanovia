<?php
/**
 * Endpoint API: guardar_plano.php
 * Recibe el diseño interactivo del plano de la boda en formato JSON y lo guarda en la nueva tabla `planos_distribucion_boda`.
 * No altera las tablas existentes.
 * 
 * Uso: POST /backend_php/guardar_plano.php (Body: JSON)
 */
require_once __DIR__ . '/db_connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Utilizar POST.'
    ]);
    exit();
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data || !isset($data['boda_id']) || empty($data['boda_id'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'JSON inválido o parámetro boda_id faltante.'
    ]);
    exit();
}

$boda_id = trim($data['boda_id']);
$titulo = isset($data['titulo']) ? trim($data['titulo']) : 'Plano de Distribución';
$datos_plano_json = json_encode($data['datos_plano'] ?? $data, JSON_UNESCAPED_UNICODE);
$fondo_url = isset($data['fondo_url']) ? $data['fondo_url'] : null;
$fondo_nombre = isset($data['fondo_nombre']) ? $data['fondo_nombre'] : null;
$escala = isset($data['escala_pixel_por_metro']) ? floatval($data['escala_pixel_por_metro']) : 50.0;

$total_mesas = isset($data['total_mesas']) ? intval($data['total_mesas']) : 0;
$total_asientos = isset($data['total_asientos']) ? intval($data['total_asientos']) : 0;
$total_asignados = isset($data['total_asignados']) ? intval($data['total_asignados']) : 0;

try {
    // Inserta o actualiza mediante ON DUPLICATE KEY UPDATE en la nueva tabla
    $sql = "
        INSERT INTO planos_distribucion_boda 
            (boda_id, titulo, datos_plano_json, fondo_url, fondo_nombre, escala_pixel_por_metro, total_mesas, total_asientos, total_asignados, fecha_actualizacion)
        VALUES 
            (:boda_id, :titulo, :datos_plano_json, :fondo_url, :fondo_nombre, :escala, :total_mesas, :total_asientos, :total_asignados, NOW())
        ON DUPLICATE KEY UPDATE 
            titulo = VALUES(titulo),
            datos_plano_json = VALUES(datos_plano_json),
            fondo_url = IFNULL(VALUES(fondo_url), fondo_url),
            fondo_nombre = IFNULL(VALUES(fondo_nombre), fondo_nombre),
            escala_pixel_por_metro = VALUES(escala_pixel_por_metro),
            total_mesas = VALUES(total_mesas),
            total_asientos = VALUES(total_asientos),
            total_asignados = VALUES(total_asignados),
            fecha_actualizacion = NOW()
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':boda_id' => $boda_id,
        ':titulo' => $titulo,
        ':datos_plano_json' => $datos_plano_json,
        ':fondo_url' => $fondo_url,
        ':fondo_nombre' => $fondo_nombre,
        ':escala' => $escala,
        ':total_mesas' => $total_mesas,
        ':total_asientos' => $total_asientos,
        ':total_asignados' => $total_asignados,
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Plano de distribución guardado exitosamente en la base de datos.',
        'boda_id' => $boda_id,
        'fecha' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al guardar el plano en MySQL: ' . $e->getMessage()
    ]);
}

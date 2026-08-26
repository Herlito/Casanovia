<?php
/**
 * Endpoint API: get_plano.php
 * Carga el diseño interactivo del plano de la boda desde la nueva tabla `planos_distribucion_boda`.
 * 
 * Uso: GET /backend_php/get_plano.php?boda_id=123
 */
require_once __DIR__ . '/db_connect.php';

$boda_id = isset($_GET['boda_id']) ? trim($_GET['boda_id']) : '';

if (empty($boda_id)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Parámetro boda_id requerido.'
    ]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            id,
            boda_id,
            titulo,
            datos_plano_json,
            fondo_url,
            fondo_nombre,
            escala_pixel_por_metro,
            total_mesas,
            total_asientos,
            total_asignados,
            fecha_creacion,
            fecha_actualizacion
        FROM planos_distribucion_boda 
        WHERE boda_id = :boda_id
        LIMIT 1
    ");
    $stmt->execute([':boda_id' => $boda_id]);
    $plano = $stmt->fetch();

    if (!$plano) {
        echo json_encode([
            'success' => true,
            'existe' => false,
            'boda_id' => $boda_id,
            'message' => 'No existe plano guardado aún para esta boda.'
        ]);
        exit();
    }

    // Decodificar JSON
    $datos_plano = json_decode($plano['datos_plano_json'], true);

    echo json_encode([
        'success' => true,
        'existe' => true,
        'boda_id' => $boda_id,
        'id' => $plano['id'],
        'titulo' => $plano['titulo'],
        'datos_plano' => $datos_plano,
        'fondo_url' => $plano['fondo_url'],
        'fondo_nombre' => $plano['fondo_nombre'],
        'escala_pixel_por_metro' => floatval($plano['escala_pixel_por_metro']),
        'total_mesas' => intval($plano['total_mesas']),
        'total_asientos' => intval($plano['total_asientos']),
        'total_asignados' => intval($plano['total_asignados']),
        'fecha_actualizacion' => $plano['fecha_actualizacion']
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al consultar plano en MySQL: ' . $e->getMessage()
    ]);
}

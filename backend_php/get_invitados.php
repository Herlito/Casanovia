<?php
/**
 * Endpoint API: get_invitados.php
 * Obtiene la lista de invitados para una boda específica desde la tabla existente `invitados`.
 * No modifica ninguna tabla existente.
 * 
 * Uso: GET /backend_php/get_invitados.php?boda_id=123
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
    // Consulta a la tabla existente `invitados`
    // Ajustar los nombres de columna según tu estructura existente (ej: nombre/full_name, id, mesa, telefono, etc.)
    $stmt = $pdo->prepare("
        SELECT 
            id,
            boda_id,
            nombre_completo,
            telefono,
            estado_rsvp,
            pases_asignados,
            requerimiento_dietetico,
            grupo_familiar,
            mesa_numero
        FROM invitados 
        WHERE boda_id = :boda_id
        ORDER BY nombre_completo ASC
    ");
    $stmt->execute([':boda_id' => $boda_id]);
    $invitados = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'boda_id' => $boda_id,
        'total' => count($invitados),
        'invitados' => $invitados
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al consultar invitados: ' . $e->getMessage()
    ]);
}

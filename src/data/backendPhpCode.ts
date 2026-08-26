export const SQL_SCHEMA_CODE = `-- ==============================================================================
-- CASANOVIA - MÓDULO INTERACTIVO DE DISEÑO DE PLANOS DE BODAS & SEATING CHART
-- Script SQL de Creación de Tablas (Compatible con MySQL 5.7+ y MySQL 8.0+)
-- ==============================================================================
-- NOTA: Este script NO altera ni añade columnas a las tablas existentes de \`bodas\` o \`invitados\`.
-- Crea una nueva tabla \`planos_distribucion_boda\` para almacenar la información completa
-- del plano (coordenadas XY, rotaciones, asignación de sillas, escala y fondo).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS \`planos_distribucion_boda\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`boda_id\` VARCHAR(128) NOT NULL COMMENT 'ID o identificador de la boda asociada',
  \`titulo\` VARCHAR(255) DEFAULT 'Plano Principal de Distribución',
  \`datos_plano_json\` LONGTEXT NOT NULL COMMENT 'Objeto JSON serializado con mesas, sillas, fondo, medidas y asignaciones',
  \`fondo_url\` LONGTEXT NULL COMMENT 'URL o Base64 del plano PDF/imagen de fondo',
  \`fondo_nombre\` VARCHAR(255) NULL COMMENT 'Nombre del archivo PDF o imagen original',
  \`escala_pixel_por_metro\` DECIMAL(10, 4) DEFAULT 50.0000 COMMENT 'Relación de escala calculada (px/m)',
  \`total_mesas\` INT UNSIGNED DEFAULT 0,
  \`total_asientos\` INT UNSIGNED DEFAULT 0,
  \`total_asignados\` INT UNSIGNED DEFAULT 0,
  \`fecha_creacion\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`fecha_actualizacion\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY \`uk_boda_id\` (\`boda_id\`),
  INDEX \`idx_boda_fecha\` (\`boda_id\`, \`fecha_actualizacion\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Almacena el diseño interactivo de planos y asientos de bodas';
`;

export const PHP_GET_INVITADOS_CODE = `<?php
/**
 * Endpoint API: get_invitados.php
 * Obtiene la lista de invitados para una boda específica desde la tabla existente \`invitados\`.
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
    // Consulta a la tabla existente \`invitados\`
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
`;

export const PHP_GUARDAR_PLANO_CODE = `<?php
/**
 * Endpoint API: guardar_plano.php
 * Recibe el diseño interactivo del plano de la boda en formato JSON y lo guarda en la nueva tabla \`planos_distribucion_boda\`.
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
`;

export const PHP_GET_PLANO_CODE = `<?php
/**
 * Endpoint API: get_plano.php
 * Carga el diseño interactivo del plano de la boda desde la nueva tabla \`planos_distribucion_boda\`.
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
`;

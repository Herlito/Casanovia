<?php
/**
 * Casanovia Backend - Subida y almacenamiento de imágenes en tu propio servidor
 * Dominio: casanovia.pe
 */

require_once __DIR__ . '/db.php';

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    @mkdir($uploadDir, 0755, true);
}

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$domainName = $_SERVER['HTTP_HOST'] ?: 'casanovia.pe';
$baseUrl = $protocol . $domainName . '/uploads/';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Manejo de archivo multipart estándar
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['file'];
        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'ico', 'pdf'];

        if (!in_array($ext, $allowedExtensions)) {
            sendResponse(['success' => false, 'error' => 'Formato de archivo no permitido.'], 400);
        }

        $uniqueName = 'img_' . uniqid() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        $targetPath = $uploadDir . $uniqueName;

        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
            $fileUrl = $baseUrl . $uniqueName;
            
            // Opcional: registrar en tabla uploaded_files
            try {
                $db = getDBConnection();
                $stmt = $db->prepare("INSERT INTO uploaded_files (id, file_name, file_path, file_url, mime_type, size_bytes) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    uniqid('file_'),
                    $file['name'],
                    $targetPath,
                    $fileUrl,
                    $file['type'],
                    $file['size']
                ]);
            } catch (Exception $e) {
                // Silencioso si no está la tabla creada
            }

            sendResponse([
                'success' => true,
                'url' => $fileUrl,
                'fileName' => $uniqueName,
                'originalName' => $file['name'],
                'size' => $file['size']
            ]);
        } else {
            sendResponse(['success' => false, 'error' => 'Error al guardar el archivo en el servidor.'], 500);
        }
    }

    // 2. Manejo de Base64 Data URL
    $input = getJsonInput();
    if (!empty($input['base64'])) {
        $data = $input['base64'];
        if (preg_match('/^data:image\/(\w+);base64,/', $data, $type)) {
            $data = substr($data, strpos($data, ',') + 1);
            $type = strtolower($type[1]);
            $decoded = base64_decode($data);

            if ($decoded === false) {
                sendResponse(['success' => false, 'error' => 'Base64 inválido.'], 400);
            }

            $uniqueName = 'img_' . uniqid() . '.' . ($type === 'jpeg' ? 'jpg' : $type);
            $targetPath = $uploadDir . $uniqueName;

            if (file_put_contents($targetPath, $decoded)) {
                $fileUrl = $baseUrl . $uniqueName;
                sendResponse([
                    'success' => true,
                    'url' => $fileUrl,
                    'fileName' => $uniqueName
                ]);
            } else {
                sendResponse(['success' => false, 'error' => 'No se pudo escribir el archivo.'], 500);
            }
        }
    }

    sendResponse(['success' => false, 'error' => 'No se recibió ningún archivo válido.'], 400);
}

// Listar imágenes subidas (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $files = [];
    if (is_dir($uploadDir)) {
        $scanned = scandir($uploadDir);
        foreach ($scanned as $f) {
            if ($f !== '.' && $f !== '..' && $f !== '.htaccess') {
                $files[] = [
                    'name' => $f,
                    'url' => $baseUrl . $f,
                    'uploadedAt' => filemtime($uploadDir . $f)
                ];
            }
        }
    }
    sendResponse(['success' => true, 'files' => $files]);
}

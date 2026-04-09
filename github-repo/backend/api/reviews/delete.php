<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_admin();
require_method('POST');

$data = body_json();
$id = (int)($data['id'] ?? 0);
if ($id <= 0) {
    json_response(['ok' => false, 'error' => 'Invalid review id'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('DELETE FROM reviews WHERE id = ?');
$stmt->execute([$id]);

json_response(['ok' => true]);

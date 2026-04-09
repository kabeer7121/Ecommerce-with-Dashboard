<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_admin();
require_method('POST');

$data = body_json();
$id = (int)($data['id'] ?? 0);
$status = trim((string)($data['status'] ?? ''));

if ($id <= 0) {
    json_response(['ok' => false, 'error' => 'Invalid review id'], 422);
}
if (!in_array($status, ['approved', 'declined', 'pending'], true)) {
    json_response(['ok' => false, 'error' => 'Invalid review status'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('UPDATE reviews SET status = ? WHERE id = ?');
$stmt->execute([$status, $id]);

json_response(['ok' => true]);

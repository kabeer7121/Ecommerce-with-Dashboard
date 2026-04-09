<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_admin();
require_method('POST');

$data = body_json();
$orderCode = trim((string)($data['id'] ?? ''));
$status = trim((string)($data['status'] ?? ''));

if ($orderCode === '' || $status === '') {
    json_response(['ok' => false, 'error' => 'Order id and status required'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE order_code = ?');
$stmt->execute([$status, $orderCode]);

json_response(['ok' => true]);

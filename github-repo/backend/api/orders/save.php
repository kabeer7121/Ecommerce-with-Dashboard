<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_method('POST');
$data = body_json();

$customer = $data['customer'] ?? [];
$items = is_array($data['items'] ?? null) ? $data['items'] : [];

if (!$items || empty($customer['name']) || empty($customer['phone']) || empty($customer['address']) || empty($customer['city'])) {
    json_response(['ok' => false, 'error' => 'Missing order data'], 422);
}

$subtotal = (float)($data['subtotal'] ?? 0);
$shipping = (float)($data['shipping'] ?? 0);
$total = (float)($data['total'] ?? 0);
$paymentMethod = (string)($data['paymentMethod'] ?? 'Cash on Delivery');
$status = (string)($data['status'] ?? 'Pending');
$orderCode = 'SE-' . substr((string)time(), -6) . rand(10, 99);

$pdo = get_pdo();
$pdo->beginTransaction();

try {
    $orderStmt = $pdo->prepare(
        'INSERT INTO orders (order_code, customer_name, customer_phone, customer_email, customer_address, customer_city, customer_province, customer_notes, subtotal, shipping, total, payment_method, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $orderStmt->execute([
        $orderCode,
        (string)$customer['name'],
        (string)$customer['phone'],
        (string)($customer['email'] ?? ''),
        (string)$customer['address'],
        (string)$customer['city'],
        (string)($customer['province'] ?? ''),
        (string)($customer['notes'] ?? ''),
        $subtotal,
        $shipping,
        $total,
        $paymentMethod,
        $status,
    ]);
    $orderId = (int)$pdo->lastInsertId();

    $itemStmt = $pdo->prepare('INSERT INTO order_items (order_id, product_id, product_name, unit_price, qty, image_url, category) VALUES (?,?,?,?,?,?,?)');
    foreach ($items as $item) {
        $itemStmt->execute([
            $orderId,
            (int)($item['id'] ?? 0),
            (string)($item['name'] ?? ''),
            (float)($item['price'] ?? 0),
            (int)($item['qty'] ?? 1),
            (string)($item['image'] ?? ''),
            (string)($item['category'] ?? ''),
        ]);
    }

    $pdo->commit();
    json_response(['ok' => true, 'orderId' => $orderCode]);
} catch (Throwable $e) {
    $pdo->rollBack();
    json_response(['ok' => false, 'error' => 'Failed to save order'], 500);
}

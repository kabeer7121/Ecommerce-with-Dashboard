<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_admin();

$pdo = get_pdo();
$orders = $pdo->query('SELECT * FROM orders ORDER BY id DESC')->fetchAll();
$itemStmt = $pdo->prepare('SELECT product_id, product_name, unit_price, qty, image_url, category FROM order_items WHERE order_id = ?');

foreach ($orders as &$order) {
    $orderId = (int)$order['id'];
    $itemStmt->execute([$orderId]);
    $items = $itemStmt->fetchAll();

    $order['items'] = array_map(static function (array $it): array {
        return [
            'id' => (int)($it['product_id'] ?? 0),
            'name' => (string)$it['product_name'],
            'price' => (float)$it['unit_price'],
            'qty' => (int)$it['qty'],
            'image' => (string)($it['image_url'] ?? ''),
            'category' => (string)($it['category'] ?? ''),
        ];
    }, $items);

    $order['id'] = (string)$order['order_code'];
    $order['subtotal'] = (float)$order['subtotal'];
    $order['shipping'] = (float)$order['shipping'];
    $order['total'] = (float)$order['total'];
    $order['customer'] = [
        'name' => (string)$order['customer_name'],
        'phone' => (string)$order['customer_phone'],
        'email' => (string)($order['customer_email'] ?? ''),
        'address' => (string)$order['customer_address'],
        'city' => (string)$order['customer_city'],
        'province' => (string)($order['customer_province'] ?? ''),
        'notes' => (string)($order['customer_notes'] ?? ''),
    ];
    $order['paymentMethod'] = (string)$order['payment_method'];
    $order['date'] = (string)$order['created_at'];
}

json_response(['ok' => true, 'orders' => $orders]);

<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_admin();
require_method('POST');

function ensure_products_highlights_column(PDO $pdo): void
{
    static $checked = false;
    if ($checked) return;
    $checked = true;
    $col = $pdo->query("SHOW COLUMNS FROM products LIKE 'highlights_json'")->fetch();
    if (!$col) {
        $pdo->exec('ALTER TABLE products ADD COLUMN highlights_json TEXT DEFAULT NULL AFTER description');
    }
}

$data = body_json();
$id = isset($data['id']) ? (int)$data['id'] : 0;

$name = trim((string)($data['name'] ?? ''));
$category = trim((string)($data['category'] ?? ''));
$price = (float)($data['price'] ?? 0);
$originalPrice = (float)($data['originalPrice'] ?? 0);
$rating = (float)($data['rating'] ?? 5);
$reviews = (int)($data['reviews'] ?? 0);
$badge = trim((string)($data['badge'] ?? 'new'));
$image = trim((string)($data['image'] ?? ''));
$description = trim((string)($data['description'] ?? ''));
$stock = (int)($data['stock'] ?? 0);
$sku = trim((string)($data['sku'] ?? ''));
$images = is_array($data['images'] ?? null) ? array_values(array_filter($data['images'])) : [];
$highlights = is_array($data['highlights'] ?? null) ? array_values(array_filter(array_map('strval', $data['highlights']))) : [];
$highlightsJson = $highlights ? json_encode($highlights, JSON_UNESCAPED_UNICODE) : null;

if ($name === '' || $category === '' || $image === '' || $description === '') {
    json_response(['ok' => false, 'error' => 'Missing required fields'], 422);
}

$pdo = get_pdo();
ensure_products_highlights_column($pdo);
$pdo->beginTransaction();

try {
    if ($id > 0) {
        $stmt = $pdo->prepare('UPDATE products SET name=?, category=?, price=?, original_price=?, rating=?, reviews_count=?, badge=?, image=?, description=?, highlights_json=?, stock=?, sku=? WHERE id=?');
        $stmt->execute([$name, $category, $price, $originalPrice, $rating, $reviews, $badge, $image, $description, $highlightsJson, $stock, $sku, $id]);
        $productId = $id;
    } else {
        $stmt = $pdo->prepare('INSERT INTO products (name, category, price, original_price, rating, reviews_count, badge, image, description, highlights_json, stock, sku) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$name, $category, $price, $originalPrice, $rating, $reviews, $badge, $image, $description, $highlightsJson, $stock, $sku]);
        $productId = (int)$pdo->lastInsertId();
    }

    $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$productId]);
    if (!$images) {
        $images = [$image];
    }
    $imgIns = $pdo->prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?,?,?)');
    foreach ($images as $idx => $img) {
        $imgIns->execute([$productId, (string)$img, $idx]);
    }

    $pdo->commit();
    json_response(['ok' => true, 'id' => $productId]);
} catch (Throwable $e) {
    $pdo->rollBack();
    json_response(['ok' => false, 'error' => 'Failed to save product'], 500);
}

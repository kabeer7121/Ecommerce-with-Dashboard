<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

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

$pdo = get_pdo();
ensure_products_highlights_column($pdo);
$rows = $pdo->query('SELECT * FROM products ORDER BY id DESC')->fetchAll();

$imgStmt = $pdo->prepare('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC');
foreach ($rows as &$row) {
    $imgStmt->execute([(int)$row['id']]);
    $images = array_map(static fn($r) => (string)$r['image_url'], $imgStmt->fetchAll());
    if (!$images) {
        $images = [(string)$row['image']];
    }
    $row['images'] = $images;
    $row['price'] = (float)$row['price'];
    $row['originalPrice'] = (float)$row['original_price'];
    $row['original_price'] = (float)$row['original_price'];
    $row['rating'] = (float)$row['rating'];
    $row['reviews'] = (int)$row['reviews_count'];
    $row['reviews_count'] = (int)$row['reviews_count'];
    $row['stock'] = (int)$row['stock'];
    $decoded = [];
    if (!empty($row['highlights_json'])) {
        $maybe = json_decode((string)$row['highlights_json'], true);
        if (is_array($maybe)) $decoded = array_values(array_filter(array_map('strval', $maybe)));
    }
    $row['highlights'] = $decoded;
}

json_response(['ok' => true, 'products' => $rows]);

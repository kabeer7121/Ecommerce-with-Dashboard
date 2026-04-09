<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_method('POST');
$data = body_json();

function ensure_reviews_image_column(PDO $pdo): void
{
    static $checked = false;
    if ($checked) return;
    $checked = true;
    $col = $pdo->query("SHOW COLUMNS FROM reviews LIKE 'image_url'")->fetch();
    if (!$col) {
        $pdo->exec('ALTER TABLE reviews ADD COLUMN image_url TEXT DEFAULT NULL AFTER review_text');
    }
}

$productId = (int)($data['productId'] ?? 0);
$productName = trim((string)($data['productName'] ?? ''));
$name = trim((string)($data['name'] ?? ''));
$rating = (int)($data['rating'] ?? 5);
$title = trim((string)($data['title'] ?? 'Customer review'));
$text = trim((string)($data['text'] ?? ''));
$imageUrl = trim((string)($data['imageUrl'] ?? ''));

if ($productId <= 0 || $productName === '' || $name === '' || $text === '') {
    json_response(['ok' => false, 'error' => 'Missing required review fields'], 422);
}

$rating = max(1, min(5, $rating));
$pdo = get_pdo();
ensure_reviews_image_column($pdo);
$stmt = $pdo->prepare('INSERT INTO reviews (product_id, product_name, reviewer_name, rating, title, review_text, image_url, status) VALUES (?,?,?,?,?,?,?,?)');
$stmt->execute([$productId, $productName, $name, $rating, $title, $text, $imageUrl !== '' ? $imageUrl : null, 'pending']);

json_response(['ok' => true]);

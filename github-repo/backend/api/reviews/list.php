<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

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

$pdo = get_pdo();
ensure_reviews_image_column($pdo);
$status = trim((string)($_GET['status'] ?? ''));
$productId = (int)($_GET['productId'] ?? 0);

$sql = 'SELECT id, product_id, product_name, reviewer_name, rating, title, review_text, image_url, status, created_at FROM reviews WHERE 1=1';
$params = [];

if ($status !== '') {
    $sql .= ' AND status = ?';
    $params[] = $status;
}
if ($productId > 0) {
    $sql .= ' AND product_id = ?';
    $params[] = $productId;
}
if (!is_admin()) {
    $sql .= " AND status = 'approved'";
}
$sql .= ' ORDER BY id DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

$reviews = array_map(static function (array $r): array {
    return [
        'id' => (int)$r['id'],
        'productId' => (int)$r['product_id'],
        'productName' => (string)$r['product_name'],
        'name' => (string)$r['reviewer_name'],
        'rating' => (int)$r['rating'],
        'title' => (string)$r['title'],
        'text' => (string)$r['review_text'],
        'imageUrl' => (string)($r['image_url'] ?? ''),
        'status' => (string)$r['status'],
        'date' => (string)$r['created_at'],
    ];
}, $rows);

json_response(['ok' => true, 'reviews' => $reviews]);

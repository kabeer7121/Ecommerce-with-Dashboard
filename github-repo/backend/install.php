<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

$pdo = get_pdo();
$schema = file_get_contents(__DIR__ . '/schema.sql');
if ($schema === false) {
    http_response_code(500);
    echo 'Failed to read schema.sql';
    exit;
}
$pdo->exec($schema);

$adminUser = 'admin';
$adminPass = 'admin123';

$stmt = $pdo->prepare('SELECT id FROM admins WHERE username = ? LIMIT 1');
$stmt->execute([$adminUser]);
$exists = $stmt->fetch();
if (!$exists) {
    $hash = password_hash($adminPass, PASSWORD_DEFAULT);
    $ins = $pdo->prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)');
    $ins->execute([$adminUser, $hash]);
}

echo "Install complete.\n";
echo "Database: " . DB_NAME . "\n";
echo "Admin user: {$adminUser}\n";
echo "Admin pass: {$adminPass}\n";

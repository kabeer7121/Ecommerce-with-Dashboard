<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_method('POST');
$data = body_json();
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($username === '' || $password === '') {
    json_response(['ok' => false, 'error' => 'Username and password required'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, (string)$admin['password_hash'])) {
    json_response(['ok' => false, 'error' => 'Invalid credentials'], 401);
}

$_SESSION['admin_id'] = (int)$admin['id'];
$_SESSION['admin_username'] = (string)$admin['username'];

json_response(['ok' => true, 'admin' => ['id' => (int)$admin['id'], 'username' => (string)$admin['username']]]);

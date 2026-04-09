<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

if (!is_admin()) {
    json_response(['ok' => true, 'loggedIn' => false]);
}

json_response([
    'ok' => true,
    'loggedIn' => true,
    'admin' => [
        'id' => (int)$_SESSION['admin_id'],
        'username' => (string)($_SESSION['admin_username'] ?? 'admin'),
    ],
]);

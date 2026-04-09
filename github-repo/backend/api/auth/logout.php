<?php
declare(strict_types=1);

require_once __DIR__ . '/../../helpers.php';

require_method('POST');
$_SESSION = [];
session_destroy();
json_response(['ok' => true]);

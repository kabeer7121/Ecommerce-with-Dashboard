<?php
declare(strict_types=1);

const DB_HOST = '127.0.0.1';
const DB_PORT = '3306';
const DB_NAME = 'shopease';
const DB_USER = 'root';
const DB_PASS = '';

function env_or_default(string $key, string $default): string
{
    $value = getenv($key);
    return $value !== false && $value !== '' ? $value : $default;
}

function get_pdo(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = env_or_default('DB_HOST', DB_HOST);
    $port = env_or_default('DB_PORT', DB_PORT);
    $dbName = env_or_default('DB_NAME', DB_NAME);
    $dbUser = env_or_default('DB_USER', DB_USER);
    $dbPass = env_or_default('DB_PASS', DB_PASS);

    // Connect directly to an existing database (shared-host friendly).
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $dbName);
    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

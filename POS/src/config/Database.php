<?php
class Database {
    private static $instance = null;
    private $connection;
    private $inTransaction = false;

    private function __construct() {
        try {
            $this->connection = new PDO(
                "mysql:host=localhost;dbname=pos_system;charset=utf8mb4",
                "root",
                "",
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_FOUND_ROWS => true
                ]
            );
        } catch (PDOException $e) {
            error_log("Database connection error: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance->connection;
    }

    // Prevent cloning of the instance
    private function __clone() {}

    // Prevent unserialize of the instance
    public function __wakeup() {}
}
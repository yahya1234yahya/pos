<?php
try {
    // Create new SQLite database
    $db = new PDO('sqlite:' . __DIR__ . '/pos.db');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Read and execute SQL file
    $sql = file_get_contents(__DIR__ . '/init.sql');
    $db->exec($sql);

    echo "Database initialized successfully!\n";
} catch (PDOException $e) {
    die("Error initializing database: " . $e->getMessage() . "\n");
}

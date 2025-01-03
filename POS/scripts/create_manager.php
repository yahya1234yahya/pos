<?php
require_once '../src/config/Database.php';
require_once '../src/controllers/UserController.php';

try {
    $userController = new UserController();
    
    // Create manager user
    $managerData = [
        'name' => 'manager',
        'role' => 'manager',
        'status' => 'active',
        'password' => '123456'
    ];
    
    $userId = $userController->createUser($managerData);
    echo "Manager user created successfully with ID: " . $userId . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

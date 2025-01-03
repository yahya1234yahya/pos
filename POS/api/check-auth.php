<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../src/config/Database.php';
require_once '../src/controllers/AuthController.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $auth = new AuthController();
        
        if (!$auth->isAuthenticated()) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not authenticated']);
            exit();
        }
        
        $user = $auth->getCurrentUser();
        if (!$user) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'User not found']);
            exit();
        }
        
        echo json_encode([
            'success' => true,
            'user' => [
                'username' => $user['username'],
                'role' => $user['role']
            ]
        ]);
    } catch (Exception $e) {
        error_log("Auth check error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Authentication check failed']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

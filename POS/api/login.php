<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get posted data
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->username) || !isset($data->password)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit();
        }

        $auth = new AuthController();
        $result = $auth->login($data->username, $data->password);
        
        if ($result['success']) {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'username' => $result['user']['username'],
                    'role' => $result['user']['role']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode($result);
        }
    } catch (Exception $e) {
        error_log("Login error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Login failed']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

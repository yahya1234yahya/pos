<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../src/config/Database.php';
require_once '../src/controllers/DashboardController.php';
require_once '../src/middleware/AuthMiddleware.php';

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

try {
    // Initialize database and auth middleware
    $db = Database::getInstance();
    $auth = new AuthMiddleware($db);

    // Debug session information
    error_log("Session data: " . print_r($_SESSION, true));

    // Verify session
    if (!$auth->isValidSession()) {
        error_log("Invalid session detected");
        http_response_code(401);
        echo json_encode([
            'success' => false, 
            'message' => 'Unauthorized access',
            'debug' => [
                'session_status' => session_status(),
                'session_id' => session_id(),
                'has_user_id' => isset($_SESSION['user_id'])
            ]
        ]);
        exit();
    }

    $dashboard = new DashboardController($db);

    // Get dashboard data
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            $result = $dashboard->getDashboardData();
            echo json_encode([
                'success' => true, 
                'data' => $result,
                'debug' => [
                    'session_id' => session_id(),
                    'user_id' => $_SESSION['user_id'] ?? null
                ]
            ]);
        } catch (Exception $e) {
            error_log("Dashboard error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => $e->getMessage(),
                'debug' => [
                    'error_type' => get_class($e),
                    'error_line' => $e->getLine(),
                    'error_file' => $e->getFile()
                ]
            ]);
        }
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log("Critical error in dashboard.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error occurred',
        'debug' => [
            'error_message' => $e->getMessage(),
            'error_type' => get_class($e),
            'error_line' => $e->getLine(),
            'error_file' => $e->getFile()
        ]
    ]);
}

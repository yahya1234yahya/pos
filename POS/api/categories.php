<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../src/config/Database.php';
require_once '../src/controllers/MenuController.php';
require_once '../src/controllers/AuthController.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $menuController = new MenuController();
    $auth = new AuthController();
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // For GET requests, allow access but verify session
            if (!$auth->isAuthenticated()) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Not authenticated'
                ]);
                exit();
            }

            $categories = $menuController->getAllCategories();
            echo json_encode([
                'success' => true,
                'categories' => $categories
            ]);
            break;
            
        case 'POST':
            // Check if user is authenticated
            if (!$auth->isAuthenticated()) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Not authenticated'
                ]);
                exit();
            }

            // Check if user has required role
            $user = $auth->getCurrentUser();
            if (!in_array($user['role'], ['admin', 'manager'])) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ]);
                exit();
            }

            // Get POST data
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            if (!isset($data['name']) || trim($data['name']) === '') {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Category name is required'
                ]);
                exit();
            }

            // Add the category
            $result = $menuController->addCategory($data);
            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Category added successfully',
                    'category' => $result
                ]);
            } else {
                throw new Exception('Failed to add category');
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Method not allowed'
            ]);
            break;
    }
} catch (Exception $e) {
    error_log('Categories API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

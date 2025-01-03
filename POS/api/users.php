<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once '../src/config/Database.php';
require_once '../src/controllers/AuthController.php';
require_once '../src/models/User.php';

try {
    $auth = new AuthController();
    $user = new User();

    // Check authentication for all requests
    if (!$auth->isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit();
    }

    // Check if user is admin
    $currentUser = $auth->getCurrentUser();
    if ($currentUser['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit();
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            $users = $user->getAllUsers();
            echo json_encode([
                'success' => true,
                'users' => $users
            ]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            // Validate required fields
            $requiredFields = ['name', 'role', 'rfid'];
            foreach ($requiredFields as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => ucfirst($field) . ' is required'
                    ]);
                    exit();
                }
            }

            // Validate role
            $validRoles = ['admin', 'manager', 'waiter', 'kitchen'];
            if (!in_array($data['role'], $validRoles)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid role'
                ]);
                exit();
            }

            try {
                $newUser = $user->createUser($data);
                echo json_encode([
                    'success' => true,
                    'message' => 'User created successfully',
                    'user' => $newUser
                ]);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'User ID is required'
                ]);
                exit();
            }

            // Validate role if provided
            if (isset($data['role'])) {
                $validRoles = ['admin', 'manager', 'waiter', 'kitchen'];
                if (!in_array($data['role'], $validRoles)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid role'
                    ]);
                    exit();
                }
            }

            try {
                $updatedUser = $user->updateUser($data['id'], $data);
                echo json_encode([
                    'success' => true,
                    'message' => 'User updated successfully',
                    'user' => $updatedUser
                ]);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        case 'DELETE':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'User ID is required'
                ]);
                exit();
            }

            // Prevent self-deletion
            if ($data['id'] == $currentUser['id']) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Cannot delete your own account'
                ]);
                exit();
            }

            try {
                $user->deleteUser($data['id']);
                echo json_encode([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
            } catch (Exception $e) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
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
    error_log('Users API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}

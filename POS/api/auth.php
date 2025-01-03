<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../src/config/Database.php';
require_once '../src/controllers/AuthController.php';
require_once '../src/models/User.php';

try {
    $auth = new AuthController();
    $user = new User();

    // For GET requests, check session status
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!$auth->isAuthenticated()) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'Not authenticated'
            ]);
            exit();
        }

        $currentUser = $auth->getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'User not found'
            ]);
            exit();
        }

        // Create consistent user object regardless of auth method
        $userResponse = [
            'id' => $currentUser['id'],
            'role' => $currentUser['role'],
            'name' => $currentUser['name'] ?? null,
            'floor' => $currentUser['floor'] ?? null
        ];

        // Add username only if it exists
        if (isset($currentUser['username'])) {
            $userResponse['username'] = $currentUser['username'];
        }

        echo json_encode([
            'success' => true,
            'user' => $userResponse
        ]);
    }
    // For POST requests, handle login
    else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'));

        // Handle logout
        if (isset($data->action) && $data->action === 'logout') {
            session_destroy();
            echo json_encode([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
            exit();
        }

        // Handle RFID authentication
        if (isset($data->rfid)) {
            $authenticatedUser = $user->authenticate($data->rfid);
            
            if (!$authenticatedUser) {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid RFID'
                ]);
                exit();
            }

            // Set session data
            $_SESSION['user_id'] = $authenticatedUser['id'];
            $_SESSION['role'] = $authenticatedUser['role'];

            // Create consistent user object for RFID auth
            $userResponse = [
                'id' => $authenticatedUser['id'],
                'role' => $authenticatedUser['role'],
                'name' => $authenticatedUser['name'],
                'floor' => $authenticatedUser['floor'] ?? null
            ];

            echo json_encode([
                'success' => true,
                'message' => 'Authentication successful',
                'user' => $userResponse
            ]);
        }
        // Handle username/password authentication
        else if (isset($data->username) && isset($data->password)) {
            $result = $auth->login($data->username, $data->password);
            
            if ($result['success']) {
                // Create consistent user object for username/password auth
                $userResponse = [
                    'id' => $result['user']['id'],
                    'role' => $result['user']['role'],
                    'username' => $result['user']['username']
                ];

                // Add optional fields if they exist
                if (isset($result['user']['name'])) {
                    $userResponse['name'] = $result['user']['name'];
                }
                if (isset($result['user']['floor'])) {
                    $userResponse['floor'] = $result['user']['floor'];
                }

                echo json_encode([
                    'success' => true,
                    'message' => 'Login successful',
                    'user' => $userResponse
                ]);
            } else {
                http_response_code(401);
                echo json_encode([
                    'success' => false,
                    'message' => $result['message']
                ]);
            }
        } else {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'Invalid authentication method'
            ]);
        }
    } else {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
    }
} catch (Exception $e) {
    error_log('Auth error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Authentication failed'
    ]);
}
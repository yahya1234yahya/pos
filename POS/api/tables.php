<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../src/config/Database.php';
require_once '../src/controllers/TableController.php';
require_once '../src/controllers/AuthController.php';

try {
    $auth = new AuthController();
    $controller = new TableController();

    // Check authentication
    if (!$auth->isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit();
    }

    $currentUser = $auth->getCurrentUser();
    
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Allow waiters to view tables
            if (!in_array($currentUser['role'], ['admin', 'manager', 'waiter'])) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ]);
                exit();
            }

            // Check if requesting a specific table
            if (isset($_GET['id'])) {
                $table = $controller->getTableById($_GET['id']);
                if ($table) {
                    echo json_encode([
                        'success' => true,
                        'table' => $table
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Table not found'
                    ]);
                }
            } else {
                // Get all tables
                $tables = $controller->getAllTables();
                echo json_encode([
                    'success' => true,
                    'tables' => $tables
                ]);
            }
            break;

        case 'POST':
        case 'PUT':
        case 'DELETE':
            $rawInput = file_get_contents('php://input');
            error_log("Raw input: " . $rawInput);
            
            $data = json_decode($rawInput, true);
            error_log("Decoded data: " . print_r($data, true));
            
            // Allow waiters to update table status
            if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($data['status']) && $currentUser['role'] === 'waiter') {
                error_log("Processing waiter table status update");
                if (!isset($data['id'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Missing required field: id'
                    ]);
                    exit();
                }

                // Check if table exists
                $table = $controller->getTableById($data['id']);
                if (!$table) {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Table not found'
                    ]);
                    exit();
                }

                // Update table status
                $updatedTable = $controller->updateTableStatus($data['id'], $data['status']);
                $response = [
                    'success' => true,
                    'message' => 'Table status updated successfully',
                    'table' => $updatedTable
                ];
                error_log("Sending response: " . json_encode($response));
                echo json_encode($response);
                exit();
            }

            // Only admin and manager can modify other table properties
            if (!in_array($currentUser['role'], ['admin', 'manager'])) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ]);
                exit();
            }

            switch ($_SERVER['REQUEST_METHOD']) {
                case 'POST':
                    if (!isset($data['number']) || !isset($data['floor'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Missing required fields'
                        ]);
                        exit();
                    }

                    try {
                        $tableId = $controller->createTable($data['number'], $data['floor']);
                        $table = $controller->getTableById($tableId);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Table created successfully',
                            'table' => $table
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
                    if (!isset($data['id'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Missing required field: id'
                        ]);
                        exit();
                    }

                    try {
                        $table = $controller->updateTable($data['id'], $data);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Table updated successfully',
                            'table' => $table
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
                    if (!isset($data['id'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Missing required field: id'
                        ]);
                        exit();
                    }

                    try {
                        $controller->deleteTable($data['id']);
                        echo json_encode([
                            'success' => true,
                            'message' => 'Table deleted successfully'
                        ]);
                    } catch (Exception $e) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => $e->getMessage()
                        ]);
                    }
                    break;
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
    error_log("Tables API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../src/config/Database.php';
require_once '../src/controllers/OrderController.php';
require_once '../src/controllers/AuthController.php';

try {
    $controller = new OrderController();
    $auth = new AuthController();
    
    // Check authentication
    if (!$auth->isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit();
    }

    // For kitchen endpoints, verify kitchen role
    if (isset($_GET['kitchen']) && !$auth->hasRole('kitchen')) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied. Kitchen role required.'
        ]);
        exit();
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['kitchen'])) {
                // Get pending orders for kitchen
                try {
                    $orders = $controller->getKitchenOrders();
                    echo json_encode([
                        'success' => true,
                        'orders' => $orders
                    ]);
                } catch (Exception $e) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => $e->getMessage()
                    ]);
                }
                break;
            }
            
            if (isset($_GET['id'])) {
                // Get specific order
                $order = $controller->getOrderById($_GET['id']);
                echo json_encode([
                    'success' => true,
                    'order' => $order
                ]);
                break;
            }
            
            // Get all orders with optional status filter
            $status = $_GET['status'] ?? null;
            $orders = $status ? 
                     $controller->getOrdersByStatus($status) : 
                     $controller->getAllOrders();
            
            echo json_encode([
                'success' => true,
                'orders' => $orders
            ]);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (isset($data['action']) && $data['action'] === 'update_status') {
                if (!isset($data['order_id']) || !isset($data['status'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Missing order_id or status'
                    ]);
                    break;
                }

                try {
                    // Use kitchen-specific update for kitchen role
                    if ($auth->hasRole('kitchen')) {
                        $orders = $controller->updateOrderStatusKitchen(
                            $data['order_id'],
                            $data['status'],
                            $data['item_id'] ?? null
                        );
                        echo json_encode([
                            'success' => true,
                            'orders' => $orders
                        ]);
                    } else {
                        $order = $controller->updateOrderStatus($data['order_id'], $data['status']);
                        echo json_encode([
                            'success' => true,
                            'order' => $order
                        ]);
                    }
                } catch (Exception $e) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => $e->getMessage()
                    ]);
                }
                break;
            }
            
            if (isset($data['action']) && $data['action'] === 'update_status_kitchen') {
                // Verify kitchen role for status updates
                if (!$auth->hasRole('kitchen')) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Access denied. Kitchen role required.'
                    ]);
                    exit();
                }

                // Update order status
                $orderId = $data['order_id'];
                $status = $data['status'];
                $itemId = $data['item_id'] ?? null;
                
                try {
                    $result = $controller->updateOrderStatusKitchen($orderId, $status, $itemId);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Order status updated',
                        'orders' => $result
                    ]);
                } catch (Exception $e) {
                    error_log("Error updating kitchen order status: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => $e->getMessage()
                    ]);
                }
                break;
            }
            
            // Create new order
            try {
                $order = $controller->createOrder($data);
                echo json_encode([
                    'success' => true,
                    'message' => 'Order created successfully',
                    'order' => $order
                ]);
            } catch (Exception $e) {
                error_log("Error creating order: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        case 'PUT':
            $data = json_decode(file_get_contents('php://input'), true);
            try {
                $orderId = $data['id'];
                $order = $controller->updateOrder($orderId, $data);
                echo json_encode([
                    'success' => true,
                    'message' => 'Order updated successfully',
                    'order' => $order
                ]);
            } catch (Exception $e) {
                error_log("Error updating order: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        case 'DELETE':
            try {
                $orderId = $_GET['id'];
                $controller->deleteOrder($orderId);
                echo json_encode([
                    'success' => true,
                    'message' => 'Order deleted successfully'
                ]);
            } catch (Exception $e) {
                error_log("Error deleting order: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => $e->getMessage()
                ]);
            }
            break;

        default:
            throw new Exception('Method not allowed');
    }

} catch (Exception $e) {
    error_log("Orders API Error: " . $e->getMessage() . "\n" . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_details' => [
            'file' => basename($e->getFile()),
            'line' => $e->getLine()
        ]
    ]);
}
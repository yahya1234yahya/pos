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
require_once '../src/controllers/MenuController.php';
require_once '../src/controllers/AuthController.php';

try {
    $auth = new AuthController();
    $menuController = new MenuController();

    // Check authentication
    if (!$auth->isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit();
    }

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get user role
            $user = $auth->getCurrentUser();
            $isManager = in_array($user['role'], ['admin', 'manager']);
            
            // Check if requesting categories
            if (isset($_GET['action']) && $_GET['action'] === 'get_categories') {
                $categories = $menuController->getAllCategories();
                echo json_encode([
                    'success' => true,
                    'categories' => $categories
                ]);
                break;
            }
            
            // Get category filter from query parameters
            $categoryId = isset($_GET['category']) ? intval($_GET['category']) : null;
            
            // Get all categories first
            $categories = $menuController->getAllCategories();
            
            // Get menu items based on category
            if ($categoryId) {
                $items = $menuController->getMenuItemsByCategory($categoryId);
            } else {
                $items = $menuController->getAllMenuItems();
            }
            
            // For manager view, group items by category
            if ($isManager) {
                $menuByCategory = [];
                foreach ($categories as $category) {
                    $categoryItems = array_filter($items, function($item) use ($category) {
                        return $item['category_id'] == $category['id'];
                    });
                    
                    $menuByCategory[] = [
                        'id' => $category['id'],
                        'name' => $category['name'],
                        'display_order' => $category['display_order'],
                        'items' => array_values($categoryItems)
                    ];
                }
                
                // Sort categories by display order
                usort($menuByCategory, function($a, $b) {
                    return $a['display_order'] - $b['display_order'];
                });
                
                echo json_encode([
                    'success' => true,
                    'menu' => $menuByCategory
                ]);
            } else {
                // For waiter view, return flat list of items
                echo json_encode([
                    'success' => true,
                    'items' => $items
                ]);
            }
            break;

        case 'POST':
            // Check if user has required role
            $user = $auth->getCurrentUser();
            if (!in_array($user['role'], ['admin', 'manager'])) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'message' => 'Unauthorized'
                ]);
                break;
            }

            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['action'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Action is required'
                ]);
                break;
            }

            switch ($data['action']) {
                case 'add_item':
                    if (!isset($data['name']) || !isset($data['category_id']) || !isset($data['price'])) {
                        http_response_code(400);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Name, category_id, and price are required'
                        ]);
                        break;
                    }

                    try {
                        $itemId = $menuController->addMenuItem(
                            $data['name'],
                            $data['category_id'],
                            $data['price'],
                            $data['description'] ?? '',
                            $data['options'] ?? []
                        );

                        echo json_encode([
                            'success' => true,
                            'message' => 'Menu item added successfully',
                            'item_id' => $itemId
                        ]);
                    } catch (Exception $e) {
                        http_response_code(500);
                        echo json_encode([
                            'success' => false,
                            'message' => $e->getMessage()
                        ]);
                    }
                    break;
                default:
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Invalid action'
                    ]);
                    break;
            }
            break;

        case 'PUT':
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

            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id']) || !isset($data['name']) || !isset($data['category_id']) || !isset($data['price'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing required fields'
                ]);
                exit();
            }

            $success = $menuController->updateMenuItem(
                $data['id'],
                $data['name'],
                $data['category_id'],
                $data['price'],
                $data['description'] ?? '',
                $data['options'] ?? []
            );

            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Menu item updated successfully' : 'Failed to update menu item'
            ]);
            break;

        case 'DELETE':
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

            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Missing item ID'
                ]);
                exit();
            }

            $success = $menuController->deleteMenuItem($data['id']);
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Menu item deleted successfully' : 'Failed to delete menu item'
            ]);
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
    error_log('Menu API Error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}
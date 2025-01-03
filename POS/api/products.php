<?php
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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

// Define the base path
define('BASE_PATH', realpath(dirname(__FILE__) . '/../'));

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include required files
require_once BASE_PATH . '/src/config/Database.php';
require_once BASE_PATH . '/src/controllers/CategoryController.php';
require_once BASE_PATH . '/src/controllers/MenuController.php';
require_once BASE_PATH . '/src/controllers/AuthController.php';

try {
    $auth = new AuthController();
    $categoryController = new CategoryController();
    $menuController = new MenuController();

    // Check authentication for all requests
    if (!$auth->isAuthenticated()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Not authenticated'
        ]);
        exit();
    }

    // Only allow GET requests
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        exit();
    }

    // Get all categories first
    $categories = $categoryController->getAllCategories();

    // Get query parameters
    $categoryId = isset($_GET['category']) ? intval($_GET['category']) : null;

    // Get menu items based on category
    if ($categoryId) {
        $items = $menuController->getMenuItemsByCategory($categoryId);
    } else {
        $items = $menuController->getAllMenuItems();
    }

    // Log the response for debugging
    error_log("API Response - Categories: " . json_encode($categories));
    error_log("API Response - Items: " . json_encode($items));
    
    echo json_encode([
        'success' => true,
        'categories' => $categories,
        'items' => $items
    ]);

} catch (Exception $e) {
    error_log("Error in products.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred while fetching menu data',
        'details' => $e->getMessage()
    ]);
}

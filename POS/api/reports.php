<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../src/config/Database.php';
require_once '../src/controllers/ReportController.php';
require_once '../src/controllers/AuthController.php';

try {
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

    // Check if user is admin or manager
    $currentUser = $auth->getCurrentUser();
    if (!in_array($currentUser['role'], ['admin', 'manager'])) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Unauthorized access'
        ]);
        exit();
    }

    $controller = new ReportController();
    
    // Get report type and date range from query parameters
    $reportType = $_GET['type'] ?? 'daily';
    $startDate = $_GET['start_date'] ?? date('Y-m-d');
    $endDate = $_GET['end_date'] ?? date('Y-m-d');

    switch ($reportType) {
        case 'daily':
            $data = $controller->getDailySales($startDate, $endDate);
            break;
            
        case 'monthly':
            $data = $controller->getMonthlySales($startDate, $endDate);
            break;
            
        case 'items':
            $data = $controller->getPopularItems($startDate, $endDate);
            break;
            
        case 'categories':
            $data = $controller->getCategorySales($startDate, $endDate);
            break;
            
        case 'staff':
            $data = $controller->getStaffPerformance($startDate, $endDate);
            break;
            
        case 'summary':
            $data = $controller->getSalesSummary($startDate, $endDate);
            break;
            
        default:
            throw new Exception('Invalid report type');
    }

    echo json_encode([
        'success' => true,
        'data' => $data
    ]);

} catch (Exception $e) {
    error_log("Reports API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error'
    ]);
}

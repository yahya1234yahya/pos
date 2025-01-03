<?php
require_once __DIR__ . '/../src/config/Database.php';
require_once __DIR__ . '/../src/controllers/AuthController.php';

header('Access-Control-Allow-Origin: http://localhost:3000');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');


// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// var_dump($_SESSION['role']);

error_reporting(E_ALL);
ini_set('display_errors', 1);
// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if user is logged in and is admin
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit();
}

try {
    $db = Database::getInstance();
    

    // Get today's date bounds
    $today_start = date('Y-m-d 00:00:00');
    $today_end = date('Y-m-d 23:59:59');
    $yesterday_start = date('Y-m-d 00:00:00', strtotime('-1 day'));
    $yesterday_end = date('Y-m-d 23:59:59', strtotime('-1 day'));

    // Get today's revenue
    $sql = "SELECT COALESCE(SUM(total_amount), 0) as today_revenue 
            FROM orders 
            WHERE created_at BETWEEN :start AND :end";
    $stmt = $db->prepare($sql);
    $stmt->execute([':start' => $today_start, ':end' => $today_end]);
    $today_revenue = $stmt->fetch()['today_revenue'];
    
    // Get yesterday's revenue for comparison
    $stmt = $db->prepare($sql);
    $stmt->execute([':start' => $yesterday_start, ':end' => $yesterday_end]);
    $yesterday_revenue = $stmt->fetch()['today_revenue'];
    $revenue_change = $yesterday_revenue > 0 
    ? round((($today_revenue - $yesterday_revenue) / $yesterday_revenue) * 100, 1)
        : 0;

    // Get today's customer count
    $sql = "SELECT COUNT(DISTINCT table_id) as customer_count 
            FROM orders 
            WHERE created_at BETWEEN :start AND :end";
    $stmt = $db->prepare($sql);
    $stmt->execute([':start' => $today_start, ':end' => $today_end]);
    $today_customers = $stmt->fetch()['customer_count'];
    
    // Get yesterday's customer count
    $stmt = $db->prepare($sql);
    $stmt->execute([':start' => $yesterday_start, ':end' => $yesterday_end]);
    $yesterday_customers = $stmt->fetch()['customer_count'];
    $customer_change = $yesterday_customers > 0 
    ? round((($today_customers - $yesterday_customers) / $yesterday_customers) * 100, 1)
    : 0;
    
    // Get items ordered and most popular item
    $sql = "SELECT COUNT(oi.id) as total_items, mi.name as popular_item
            FROM order_items oi
            LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
            LEFT JOIN orders o ON oi.order_id = o.id
            WHERE o.created_at BETWEEN :start AND :end
            GROUP BY mi.id
            ORDER BY COUNT(oi.id) DESC
            LIMIT 1";
    $stmt = $db->prepare($sql);
    $stmt->execute([':start' => $today_start, ':end' => $today_end]);
    $items_data = $stmt->fetch();
    $total_items = $items_data ? $items_data['total_items'] : 0;
    $popular_item = $items_data ? $items_data['popular_item'] : 'None';
    
    // Get active staff count
    $sql = "SELECT role, COUNT(*) as count 
            FROM users 
            WHERE status = 'active' 
            GROUP BY role";
    $stmt = $db->prepare($sql);
    $stmt->execute();
    $staff_counts = ['kitchen' => 0, 'waiters' => 0];
    while ($row = $stmt->fetch()) {
        if ($row['role'] === 'kitchen') $staff_counts['kitchen'] = $row['count'];
        if ($row['role'] === 'waiter') $staff_counts['waiters'] = $row['count'];
    }
    
    // Get waiters report
    // $sql = "SELECT 
    //             u.name,
    //             COUNT(DISTINCT o.id) as orders_taken,
    //             COALESCE(SUM(o.total_amount), 0) as total_sales,
    //             COUNT(oi.id) as items_sold,
    //             COALESCE(AVG(o.total_amount), 0) as avg_order,
    //             u.status,
    //             (
    //                 SELECT mi.name
    //                 FROM order_items oi2
    //                 JOIN orders o2 ON oi2.order_id = o2.id
    //                 JOIN menu_items mi ON oi2.menu_item_id = mi.id
    //                 WHERE o2.waiter_id = u.id
    //                 AND o2.created_at BETWEEN :start AND :end
    //                 GROUP BY mi.id
    //                 ORDER BY COUNT(*) DESC
    //                 LIMIT 1
    //             ) as most_sold_item
    //         FROM users u
    //         LEFT JOIN orders o ON u.id = o.waiter_id 
    //             AND o.created_at BETWEEN :start AND :end
    //         LEFT JOIN order_items oi ON o.id = oi.order_id
    //         WHERE u.role = 'waiter'
    //         GROUP BY u.id";
    // $stmt = $db->prepare($sql);
    // $stmt->execute([':start' => $today_start, ':end' => $today_end]);
    // $waiters = [];
    // while ($row = $stmt->fetch()) {
    //     $waiters[] = [
    //         'name' => $row['name'],
    //         'orders' => $row['orders_taken'],
    //         'sales' => $row['total_sales'],
    //         'items' => $row['items_sold'],
    //         'avgOrder' => $row['avg_order'],
    //         'mostSold' => $row['most_sold_item'] ?? 'None',
    //         'status' => $row['status']
    //     ];
    // }
    
    // Return all stats
    echo json_encode([
        'success' => true,
        'stats' => [
            'revenue' => [
                'value' => floatval($today_revenue),
                'change' => $revenue_change
            ],
            'customers' => [
                'value' => intval($today_customers),
                'change' => $customer_change
            ],
            'orders' => [
                'value' => intval($total_items),
                'popular' => $popular_item
            ],
            'staff' => $staff_counts,
            // 'waiters' => $waiters
        ]
    ]);

} catch (Exception $e) {
    error_log("Error in stats.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error'
    ]);
}

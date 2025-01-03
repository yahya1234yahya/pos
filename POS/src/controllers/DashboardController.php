<?php
class DashboardController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function getDashboardData() {
        try {
            $data = [
                'overview' => $this->getTodayOverview(),
                'popularItems' => $this->getPopularItems(),
                'staffPerformance' => $this->getStaffPerformance(),
                'recentActivity' => $this->getRecentActivity()
            ];
            return $data;
        } catch (Exception $e) {
            error_log("Error in getDashboardData: " . $e->getMessage());
            throw $e;
        }
    }

    private function getTodayOverview() {
        try {
            $today = date('Y-m-d');
            $query = "SELECT 
                        COUNT(*) as total_orders,
                        COALESCE(SUM(total_amount), 0) as total_revenue,
                        COALESCE(AVG(total_amount), 0) as avg_order_value
                     FROM orders 
                     WHERE DATE(created_at) = :today";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':today', $today);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return $result ?: [
                'total_orders' => 0,
                'total_revenue' => 0,
                'avg_order_value' => 0
            ];
        } catch (Exception $e) {
            error_log("Error in getTodayOverview: " . $e->getMessage());
            throw $e;
        }
    }

    private function getPopularItems() {
        try {
            $today = date('Y-m-d');
            $query = "SELECT 
                        m.name,
                        COUNT(*) as order_count
                     FROM order_items oi
                     JOIN orders o ON o.id = oi.order_id
                     JOIN menu_items m ON m.id = oi.menu_item_id
                     WHERE DATE(o.created_at) = :today
                     GROUP BY m.id, m.name
                     ORDER BY order_count DESC
                     LIMIT 3";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':today', $today);
            $stmt->execute();
            
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return !empty($result) ? $result : [];
        } catch (Exception $e) {
            error_log("Error in getPopularItems: " . $e->getMessage());
            throw $e;
        }
    }

    private function getStaffPerformance() {
        try {
            $today = date('Y-m-d');
            $query = "SELECT 
                        u.name,
                        COUNT(*) as order_count
                     FROM orders o
                     JOIN users u ON u.id = o.waiter_id
                     WHERE DATE(o.created_at) = :today
                     GROUP BY u.id, u.name
                     ORDER BY order_count DESC
                     LIMIT 3";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':today', $today);
            $stmt->execute();
            
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return !empty($result) ? $result : [];
        } catch (Exception $e) {
            error_log("Error in getStaffPerformance: " . $e->getMessage());
            throw $e;
        }
    }

    private function getRecentActivity() {
        try {
            $query = "SELECT 
                        o.id as order_id,
                        o.status,
                        o.created_at,
                        t.number as table_number
                     FROM orders o
                     LEFT JOIN tables t ON t.id = o.table_id
                     ORDER BY o.created_at DESC
                     LIMIT 3";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return !empty($result) ? $result : [];
        } catch (Exception $e) {
            error_log("Error in getRecentActivity: " . $e->getMessage());
            throw $e;
        }
    }
}

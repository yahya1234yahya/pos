<?php

class ReportController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getDailySales($startDate, $endDate) {
        try {
            $sql = "SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as order_count,
                        SUM(total_amount) as total_sales,
                        AVG(total_amount) as average_order_value
                    FROM orders 
                    WHERE DATE(created_at) BETWEEN :start_date AND :end_date
                        AND status = 'completed'
                    GROUP BY DATE(created_at)
                    ORDER BY date";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in ReportController::getDailySales: " . $e->getMessage());
            throw new Exception("Failed to fetch daily sales");
        }
    }

    public function getMonthlySales($startDate, $endDate) {
        try {
            $sql = "SELECT 
                        DATE_FORMAT(created_at, '%Y-%m') as month,
                        COUNT(*) as order_count,
                        SUM(total_amount) as total_sales,
                        AVG(total_amount) as average_order_value
                    FROM orders 
                    WHERE DATE(created_at) BETWEEN :start_date AND :end_date
                        AND status = 'completed'
                    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
                    ORDER BY month";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in ReportController::getMonthlySales: " . $e->getMessage());
            throw new Exception("Failed to fetch monthly sales");
        }
    }

    public function getPopularItems($startDate, $endDate) {
        try {
            $sql = "SELECT 
                        m.name as item_name,
                        m.category,
                        COUNT(*) as order_count,
                        SUM(od.quantity) as total_quantity,
                        SUM(od.price * od.quantity) as total_revenue
                    FROM order_details od
                    JOIN orders o ON od.order_id = o.id
                    JOIN menu m ON od.menu_id = m.id
                    WHERE DATE(o.created_at) BETWEEN :start_date AND :end_date
                        AND o.status = 'completed'
                    GROUP BY m.id, m.name, m.category
                    ORDER BY total_quantity DESC
                    LIMIT 10";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in ReportController::getPopularItems: " . $e->getMessage());
            throw new Exception("Failed to fetch popular items");
        }
    }

    public function getCategorySales($startDate, $endDate) {
        try {
            $sql = "SELECT 
                        m.category,
                        COUNT(DISTINCT o.id) as order_count,
                        SUM(od.quantity) as total_quantity,
                        SUM(od.price * od.quantity) as total_revenue
                    FROM order_details od
                    JOIN orders o ON od.order_id = o.id
                    JOIN menu m ON od.menu_id = m.id
                    WHERE DATE(o.created_at) BETWEEN :start_date AND :end_date
                        AND o.status = 'completed'
                    GROUP BY m.category
                    ORDER BY total_revenue DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in ReportController::getCategorySales: " . $e->getMessage());
            throw new Exception("Failed to fetch category sales");
        }
    }

    public function getStaffPerformance($startDate, $endDate) {
        try {
            $sql = "SELECT 
                        u.name as staff_name,
                        u.role,
                        COUNT(DISTINCT o.id) as order_count,
                        SUM(o.total_amount) as total_sales,
                        AVG(o.total_amount) as average_order_value
                    FROM orders o
                    JOIN users u ON o.user_id = u.id
                    WHERE DATE(o.created_at) BETWEEN :start_date AND :end_date
                        AND o.status = 'completed'
                    GROUP BY u.id, u.name, u.role
                    ORDER BY total_sales DESC";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in ReportController::getStaffPerformance: " . $e->getMessage());
            throw new Exception("Failed to fetch staff performance");
        }
    }

    public function getSalesSummary($startDate, $endDate) {
        try {
            // Total orders, revenue, and items sold
            $sql = "SELECT 
                        COUNT(DISTINCT o.id) as total_orders,
                        SUM(o.total_amount) as total_sales,
                        AVG(o.total_amount) as average_order,
                        COUNT(od.id) as total_items,
                        SUM(od.quantity) as items_sold,
                        MIN(o.total_amount) as min_order,
                        MAX(o.total_amount) as max_order,
                        AVG(od.quantity) as avg_items_per_order
                    FROM orders o
                    LEFT JOIN order_details od ON o.id = od.order_id
                    WHERE DATE(o.created_at) BETWEEN :start_date AND :end_date
                        AND o.status = 'completed'";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            $summary = $stmt->fetch(PDO::FETCH_ASSOC);

            // Calculate daily averages
            $sql = "SELECT 
                        COUNT(DISTINCT DATE(created_at)) as total_days,
                        SUM(total_amount) / COUNT(DISTINCT DATE(created_at)) as daily_average,
                        COUNT(*) / COUNT(DISTINCT DATE(created_at)) as orders_per_day
                    FROM orders 
                    WHERE DATE(created_at) BETWEEN :start_date AND :end_date
                        AND status = 'completed'";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            $dailyStats = $stmt->fetch(PDO::FETCH_ASSOC);
            $summary = array_merge($summary, $dailyStats);

            // Get busiest days
            $sql = "SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as order_count,
                        SUM(total_amount) as daily_sales
                    FROM orders 
                    WHERE DATE(created_at) BETWEEN :start_date AND :end_date
                        AND status = 'completed'
                    GROUP BY DATE(created_at)
                    ORDER BY order_count DESC
                    LIMIT 5";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            $summary['busiest_days'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get peak hours
            $sql = "SELECT 
                        HOUR(created_at) as hour,
                        COUNT(*) as order_count,
                        SUM(total_amount) as hour_sales,
                        AVG(total_amount) as avg_order_value
                    FROM orders 
                    WHERE DATE(created_at) BETWEEN :start_date AND :end_date
                        AND status = 'completed'
                    GROUP BY HOUR(created_at)
                    ORDER BY order_count DESC
                    LIMIT 5";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':start_date' => $startDate,
                ':end_date' => $endDate
            ]);

            $summary['peak_hours'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $summary;
        } catch (Exception $e) {
            error_log("Error in ReportController::getSalesSummary: " . $e->getMessage());
            throw new Exception("Failed to fetch sales summary");
        }
    }
}

<?php
class Order {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function create($tableId, $waiterId, $type = 'dine-in') {
        $this->db->query(
            "INSERT INTO orders (table_id, waiter_id, type) 
             VALUES (:table_id, :waiter_id, :type)",
            [
                ':table_id' => $tableId,
                ':waiter_id' => $waiterId,
                ':type' => $type
            ]
        );
        return $this->db->lastInsertId();
    }

    public function addItem($orderId, $menuItemId, $quantity, $unitPrice, $notes = '') {
        $this->db->query(
            "INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes)
             VALUES (:order_id, :menu_item_id, :quantity, :unit_price, :notes)",
            [
                ':order_id' => $orderId,
                ':menu_item_id' => $menuItemId,
                ':quantity' => $quantity,
                ':unit_price' => $unitPrice,
                ':notes' => $notes
            ]
        );
        return $this->db->lastInsertId();
    }

    public function updateStatus($orderId, $status) {
        $completedAt = ($status === 'paid') ? "datetime('now')" : "NULL";
        return $this->db->query(
            "UPDATE orders 
             SET status = :status, completed_at = $completedAt 
             WHERE id = :id",
            [':status' => $status, ':id' => $orderId]
        );
    }

    public function getOrdersByWaiter($waiterId) {
        $result = $this->db->query(
            "SELECT o.*, t.number as table_number 
             FROM orders o
             LEFT JOIN tables t ON o.table_id = t.id
             WHERE o.waiter_id = :waiter_id AND o.status != 'paid'
             ORDER BY o.created_at DESC",
            [':waiter_id' => $waiterId]
        );
        return $this->db->fetchAll($result);
    }

    public function getKitchenOrders() {
        $result = $this->db->query(
            "SELECT o.*, t.number as table_number, u.name as waiter_name
             FROM orders o
             LEFT JOIN tables t ON o.table_id = t.id
             LEFT JOIN users u ON o.waiter_id = u.id
             WHERE o.status IN ('pending', 'preparing')
             ORDER BY o.created_at ASC"
        );
        return $this->db->fetchAll($result);
    }
}
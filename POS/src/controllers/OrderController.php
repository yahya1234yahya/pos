<?php
require_once __DIR__ . '/../config/Database.php';

class OrderController {
    private $db;
    private $validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
    private $activeStatuses = ['pending', 'preparing', 'ready'];
    private $validStatusTransitions = [
        'pending' => ['preparing', 'ready', 'completed', 'cancelled'],
        'preparing' => ['ready', 'completed', 'cancelled'],
        'ready' => ['completed', 'cancelled'],
        'completed' => [],
        'cancelled' => []
    ];

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAllOrders() {
        try {
            $sql = "SELECT o.*, t.number as table_number, u.name as waiter_name 
                    FROM orders o
                    LEFT JOIN tables t ON o.table_id = t.id
                    LEFT JOIN users u ON o.waiter_id = u.id
                    ORDER BY 
                        CASE 
                            WHEN o.status IN ('completed', 'cancelled') THEN 1 
                            ELSE 0 
                        END,
                        CASE o.status
                            WHEN 'pending' THEN 1
                            WHEN 'preparing' THEN 2
                            WHEN 'ready' THEN 3
                            WHEN 'completed' THEN 4
                            WHEN 'cancelled' THEN 5
                            ELSE 6
                        END,
                        o.created_at DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $orders = $stmt->fetchAll();

            // Get items and their options for each order
            foreach ($orders as &$order) {
                $order['items'] = $this->getOrderItems($order['id']);
            }

            return $orders;
        } catch (Exception $e) {
            error_log("Error in getAllOrders: " . $e->getMessage());
            throw new Exception("Failed to get orders: " . $e->getMessage());
        }
    }

    private function getOrderItems($orderId) {
        try {
            // First get the order items
            $sql = "SELECT oi.*, mi.name as item_name, mi.price as unit_price
                    FROM order_items oi
                    LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
                    WHERE oi.order_id = :order_id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':order_id' => $orderId]);
            $items = $stmt->fetchAll();

            // Then get options for each item
            foreach ($items as &$item) {
                $sql = "SELECT oio.*, ov.value, ov.extra_cost, io.option_name, io.option_type
                        FROM order_item_options oio
                        LEFT JOIN option_values ov ON oio.option_value_id = ov.id
                        LEFT JOIN item_options io ON ov.option_id = io.id
                        WHERE oio.order_item_id = :order_item_id";
                
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':order_item_id' => $item['id']]);
                $item['options'] = $stmt->fetchAll();
            }

            return $items;
        } catch (Exception $e) {
            error_log("Error in getOrderItems: " . $e->getMessage());
            throw new Exception("Failed to get order items: " . $e->getMessage());
        }
    }

    public function getOrdersByStatus($status) {
        if (!in_array($status, $this->validStatuses)) {
            throw new Exception("Invalid status");
        }

        try {
            $sql = "SELECT o.*, t.number as table_number, u.name as waiter_name 
                    FROM orders o
                    LEFT JOIN tables t ON o.table_id = t.id
                    LEFT JOIN users u ON o.waiter_id = u.id
                    WHERE o.status = :status
                    ORDER BY 
                        CASE 
                            WHEN o.status IN ('completed', 'cancelled') THEN 1 
                            ELSE 0 
                        END,
                        o.created_at DESC";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':status' => $status]);
            $orders = $stmt->fetchAll();

            // Get items and their options for each order
            foreach ($orders as &$order) {
                $order['items'] = $this->getOrderItems($order['id']);
            }

            return $orders;
        } catch (Exception $e) {
            error_log("Error in getOrdersByStatus: " . $e->getMessage());
            throw new Exception("Failed to get orders by status: " . $e->getMessage());
        }
    }

    public function updateOrderStatus($orderId, $newStatus) {
        try {
            error_log("Updating order $orderId to status $newStatus");
            
            // Validate the new status
            if (!in_array($newStatus, $this->validStatuses)) {
                throw new Exception("Invalid status: {$newStatus}");
            }

            // Get current order status
            $sql = "SELECT status, table_id FROM orders WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $orderId]);
            $order = $stmt->fetch();

            if (!$order) {
                throw new Exception("Order not found");
            }

            $currentStatus = $order['status'];
            error_log("Current status: $currentStatus, New status: $newStatus");

            // Validate status transition
            if (!isset($this->validStatusTransitions[$currentStatus]) || 
                !in_array($newStatus, $this->validStatusTransitions[$currentStatus])) {
                throw new Exception("Invalid status transition from {$currentStatus} to {$newStatus}");
            }

            if (!$this->db->beginTransaction()) {
                throw new Exception("Could not start transaction");
            }

            // Update order status
            $sql = "UPDATE orders SET status = :status, total_amount = $item['unit_price']";
            if ($newStatus === 'completed') {
                $sql .= ", completed_at = CURRENT_TIMESTAMP";
            }


            $sql .= " WHERE id = :id";

            $stmt = $this->db->prepare($sql);
            if (!$stmt->execute([':id' => $orderId, ':status' => $newStatus])) {
                throw new Exception("Failed to update order status");
            }

            // Handle table status based on order status
            if ($order['table_id']) {
                $tableStatus = 'occupied';
                if ($newStatus === 'completed' || $newStatus === 'cancelled') {
                    $tableStatus = 'available';
                }

                $sql = "UPDATE tables SET status = :status WHERE id = :table_id";
                $stmt = $this->db->prepare($sql);
                if (!$stmt->execute([':table_id' => $order['table_id'], ':status' => $tableStatus])) {
                    throw new Exception("Failed to update table status");
                }
            }

            if (!$this->db->commit()) {
                throw new Exception("Could not commit transaction");
            }

            // Get updated order
            $sql = "SELECT o.*, t.number as table_number, u.name as waiter_name 
                    FROM orders o
                    LEFT JOIN tables t ON o.table_id = t.id
                    LEFT JOIN users u ON o.waiter_id = u.id
                    WHERE o.id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $orderId]);
            $updatedOrder = $stmt->fetch();
            
            if ($updatedOrder) {
                $updatedOrder['items'] = $this->getOrderItems($orderId);
            }

            return $updatedOrder;
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Error in updateOrderStatus: " . $e->getMessage());
            throw new Exception("Failed to update order status: " . $e->getMessage());
        }
    }

    public function createOrder($data) {
        try {
            // Validate required fields
            if (!isset($data['table_id']) || !isset($data['waiter_id']) || !isset($data['items']) || empty($data['items'])) {
                throw new Exception("Missing required fields");
            }

            if (!$this->db->beginTransaction()) {
                throw new Exception("Could not start transaction");
            }

            // Insert order
            $sql = "INSERT INTO orders (table_id, waiter_id, status, type) 
                    VALUES (:table_id, :waiter_id, :status, :type)";
            
            $stmt = $this->db->prepare($sql);
            if (!$stmt->execute([
                ':table_id' => $data['table_id'],
                ':waiter_id' => $data['waiter_id'],
                ':status' => 'pending',
                ':type' => $data['type'] ?? 'dine-in'
            ])) {
                throw new Exception("Failed to create order");
            }

            $orderId = $this->db->lastInsertId();

            // Insert order items
            $sql = "INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) 
                    VALUES (:order_id, :menu_item_id, :quantity, :unit_price, :notes)";
            
            $stmt = $this->db->prepare($sql);

            foreach ($data['items'] as $item) {
                if (!isset($item['menu_item_id']) || !isset($item['quantity']) || !isset($item['unit_price'])) {
                    throw new Exception("Invalid item data");
                }

                if (!$stmt->execute([
                    ':order_id' => $orderId,
                    ':menu_item_id' => $item['menu_item_id'],
                    ':quantity' => $item['quantity'],
                    ':unit_price' => $item['unit_price'],
                    ':notes' => $item['notes'] ?? null
                ])) {
                    throw new Exception("Failed to create order item");
                }
            }

            // Update table status
            $sql = "UPDATE tables SET status = 'occupied' WHERE id = :table_id";
            $stmt = $this->db->prepare($sql);
            if (!$stmt->execute([':table_id' => $data['table_id']])) {
                throw new Exception("Failed to update table status");
            }

            if (!$this->db->commit()) {
                throw new Exception("Could not commit transaction");
            }

            // Return full order object
            return $this->getOrderById($orderId);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Error in createOrder: " . $e->getMessage());
            throw new Exception("Failed to create order: " . $e->getMessage());
        }
    }

    public function getOrderById($id) {
        try {
            $sql = "SELECT o.*, t.number as table_number, u.name as waiter_name 
                    FROM orders o
                    LEFT JOIN tables t ON o.table_id = t.id
                    LEFT JOIN users u ON o.waiter_id = u.id
                    WHERE o.id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $order = $stmt->fetch();

            if (!$order) {
                throw new Exception("Order not found");
            }

            // Get order items and their options
            $order['items'] = $this->getOrderItems($id);

            return $order;
        } catch (Exception $e) {
            error_log("Error in getOrderById: " . $e->getMessage());
            throw new Exception("Failed to get order: " . $e->getMessage());
        }
    }

    public function getOrderForReceipt($orderId) {
        try {
            // Get order details
            $sql = "SELECT o.*, t.number as table_number, u.name as waiter_name
                    FROM orders o
                    LEFT JOIN tables t ON o.table_id = t.id
                    LEFT JOIN users u ON o.waiter_id = u.id
                    WHERE o.id = :order_id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':order_id' => $orderId]);
            $order = $stmt->fetch();

            if (!$order) {
                throw new Exception('Order not found');
            }

            // Get order items and their options
            $items = $this->getOrderItems($orderId);

            // Calculate totals
            $subtotal = 0;
            foreach ($items as &$item) {
                $item['total'] = $item['quantity'] * floatval($item['unit_price']);
                $subtotal += $item['total'];
            }
            $tax = $subtotal * 0.1; // 10% tax
            $total = $subtotal + $tax;

            return [
                'id' => $orderId,
                'table_number' => $order['table_number'],
                'waiter_name' => $order['waiter_name'],
                'status' => $order['status'],
                'type' => $order['type'],
                'created_at' => $order['created_at'],
                'items' => $items,
                'subtotal' => $subtotal,
                'tax' => $tax,
                'total' => $total
            ];
        } catch (Exception $e) {
            error_log("Error in getOrderForReceipt: " . $e->getMessage());
            throw new Exception("Failed to get order receipt: " . $e->getMessage());
        }
    }

    public function getOrdersByStatuses($statuses) {
        try {
            $statusArray = explode(',', $statuses);
            $placeholders = str_repeat('?,', count($statusArray) - 1) . '?';
            
            $sql = "SELECT o.*, t.number as table_number, u.name as waiter_name
                    FROM orders o
                    LEFT JOIN tables t ON o.table_id = t.id
                    LEFT JOIN users u ON o.waiter_id = u.id
                    WHERE o.status IN ($placeholders)
                    ORDER BY 
                        CASE 
                            WHEN o.status IN ('completed', 'cancelled') THEN 1 
                            ELSE 0 
                        END,
                        o.created_at DESC";
                    
            $stmt = $this->db->prepare($sql);
            $stmt->execute($statusArray);
            $orders = $stmt->fetchAll();

            // Get items and their options for each order
            foreach ($orders as &$order) {
                $order['items'] = $this->getOrderItems($order['id']);
            }

            return $orders;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public function getOrdersByWaiter($waiterId) {
        try {
            $sql = "SELECT o.*, t.number as table_number
                    FROM orders o
                    LEFT JOIN tables t ON o.table_id = t.id
                    WHERE o.waiter_id = :waiter_id 
                    AND o.status NOT IN ('completed', 'cancelled')
                    ORDER BY 
                        CASE 
                            WHEN o.status IN ('completed', 'cancelled') THEN 1 
                            ELSE 0 
                        END,
                        o.created_at DESC";
                    
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':waiter_id' => $waiterId]);
            $orders = $stmt->fetchAll();

            // Get items and their options for each order
            foreach ($orders as &$order) {
                $order['items'] = $this->getOrderItems($order['id']);
            }

            return $orders;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public function deleteOrder($id) {
        try {
            // Delete order items first
            $sql = "DELETE FROM order_items WHERE order_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);

            // Delete the order
            $sql = "DELETE FROM orders WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);

            return true;
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }

    public function getKitchenOrders() {
        try {
            // First get orders that need kitchen attention
            $sql = "SELECT o.*, t.number as table_number, t.floor as table_floor, u.name as waiter_name,
                          (SELECT COUNT(*) FROM order_items WHERE order_id = o.id AND status IN ('pending', 'preparing')) as pending_items
                    FROM orders o
                    LEFT JOIN tables t ON o.table_id = t.id
                    LEFT JOIN users u ON o.waiter_id = u.id
                    WHERE o.status NOT IN ('completed', 'cancelled')
                    HAVING pending_items > 0
                    ORDER BY o.created_at ASC";

            $stmt = $this->db->prepare($sql);
            if (!$stmt->execute()) {
                throw new Exception("Failed to execute kitchen orders query");
            }
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (!is_array($orders)) {
                return [];
            }

            // Get items and their options for each order
            foreach ($orders as &$order) {
                if (!isset($order['id'])) {
                    continue;
                }

                // Get order items that need attention
                $sql = "SELECT oi.*, mi.name, c.name as category_name, mi.price 
                        FROM order_items oi
                        LEFT JOIN menu_items mi ON oi.menu_item_id = mi.id
                        LEFT JOIN categories c ON mi.category_id = c.id
                        WHERE oi.order_id = :order_id 
                        AND oi.status IN ('pending', 'preparing')";
                
                $stmt = $this->db->prepare($sql);
                if (!$stmt->execute([':order_id' => $order['id']])) {
                    throw new Exception("Failed to fetch items for order " . $order['id']);
                }
                $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (!is_array($items)) {
                    $order['items'] = [];
                    continue;
                }

                // Format items for frontend
                $order['items'] = array_map(function($item) {
                    return [
                        'id' => $item['id'] ?? null,
                        'menu_id' => $item['menu_item_id'] ?? null,
                        'name' => $item['name'] ?? 'Unknown Item',
                        'category' => $item['category_name'] ?? 'uncategorized',
                        'quantity' => intval($item['quantity'] ?? 1),
                        'unit_price' => floatval($item['price'] ?? 0),
                        'status' => $item['status'] ?? 'pending',
                        'notes' => $item['notes'] ?? ''
                    ];
                }, $items);

                // Format dates
                $order['created_at'] = isset($order['created_at']) ? 
                    date('Y-m-d H:i:s', strtotime($order['created_at'])) : 
                    date('Y-m-d H:i:s');
                    
                if (!empty($order['completed_at'])) {
                    $order['completed_at'] = date('Y-m-d H:i:s', strtotime($order['completed_at']));
                }
            }

            // Remove orders with no pending items
            $orders = array_filter($orders, function($order) {
                return !empty($order['items']);
            });

            return array_values($orders);
        } catch (Exception $e) {
            error_log("Error in getKitchenOrders: " . $e->getMessage());
            throw new Exception("Failed to get kitchen orders: " . $e->getMessage());
        }
    }

    public function updateOrderStatusKitchen($orderId, $status, $itemId = null) {
        if (!in_array($status, ['preparing', 'ready', 'completed'])) {
            throw new Exception("Invalid status for kitchen update");
        }

        try {
            $this->db->beginTransaction();

            if ($itemId) {
                // Update specific item status
                $sql = "UPDATE order_items SET status = :status WHERE id = :item_id AND order_id = :order_id";
                $stmt = $this->db->prepare($sql);
                if (!$stmt->execute([
                    ':status' => $status,
                    ':item_id' => $itemId,
                    ':order_id' => $orderId
                ])) {
                    throw new Exception("Failed to update item status");
                }

                // Check if all items are ready/completed
                $sql = "SELECT COUNT(*) as total,
                              SUM(CASE WHEN status = 'ready' OR status = 'completed' THEN 1 ELSE 0 END) as ready_count
                       FROM order_items 
                       WHERE order_id = :order_id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':order_id' => $orderId]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);

                // If all items are ready, update order status
                if ($result['total'] == $result['ready_count']) {
                    $sql = "UPDATE orders SET status = 'ready' WHERE id = :order_id";
                    $stmt = $this->db->prepare($sql);
                    if (!$stmt->execute([':order_id' => $orderId])) {
                        throw new Exception("Failed to update order status");
                    }
                } elseif ($status === 'preparing') {
                    // If any item is preparing, ensure order status reflects this
                    $sql = "UPDATE orders SET status = 'preparing' WHERE id = :order_id AND status = 'pending'";
                    $stmt = $this->db->prepare($sql);
                    if (!$stmt->execute([':order_id' => $orderId])) {
                        throw new Exception("Failed to update order status to preparing");
                    }
                }
            } else {
                // Update entire order status
                $sql = "UPDATE orders SET status = :status WHERE id = :order_id";
                $stmt = $this->db->prepare($sql);
                if (!$stmt->execute([
                    ':status' => $status,
                    ':order_id' => $orderId
                ])) {
                    throw new Exception("Failed to update order status");
                }

                // Update all pending items to match order status
                $sql = "UPDATE order_items SET status = :status 
                       WHERE order_id = :order_id AND status = 'pending'";
                $stmt = $this->db->prepare($sql);
                if (!$stmt->execute([
                    ':status' => $status,
                    ':order_id' => $orderId
                ])) {
                    throw new Exception("Failed to update order items status");
                }
            }

            $this->db->commit();
            return $this->getKitchenOrders();
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error in updateOrderStatusKitchen: " . $e->getMessage());
            throw new Exception("Failed to update order status: " . $e->getMessage());
        }
    }

    public function getOrderKitchen($id) {
        try {
            $sql = "SELECT 
                        o.id as order_id,
                        o.table_id,
                        o.status as order_status,
                        o.created_at,
                        o.notes,
                        t.number as table_number
                    FROM orders o
                    JOIN tables t ON o.table_id = t.id
                    WHERE o.id = :id";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$order) {
                throw new Exception("Order not found");
            }

            // Get order items and their options
            $sql = "SELECT 
                        od.id as item_id,
                        od.menu_id,
                        od.quantity,
                        od.status as item_status,
                        od.notes as item_notes,
                        m.name as item_name,
                        m.category,
                        m.price
                    FROM order_details od
                    JOIN menu m ON od.menu_id = m.id
                    WHERE od.order_id = :order_id";

            $stmt = $this->db->prepare($sql);
            $stmt->execute([':order_id' => $id]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $order['items'] = $items;
            return $order;
        } catch (Exception $e) {
            error_log("Error in OrderController::getOrderKitchen: " . $e->getMessage());
            throw new Exception("Failed to fetch order");
        }
    }
}
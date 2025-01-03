<?php

class TableController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAllTables() {
        try {
            // Get all tables with their current status
            $sql = "SELECT t.*, 
                   CASE 
                       WHEN o.id IS NOT NULL AND o.status != 'completed' THEN 'occupied'
                       ELSE 'available'
                   END as status
                   FROM tables t
                   LEFT JOIN orders o ON t.id = o.table_id AND o.status != 'completed'
                   ORDER BY t.floor, t.number";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in TableController::getAllTables: " . $e->getMessage());
            throw new Exception("Failed to fetch tables");
        }
    }

    public function getTableById($tableId) {
        try {
            // Get table with its current status
            $sql = "SELECT t.*, 
                   CASE 
                       WHEN o.id IS NOT NULL AND o.status != 'completed' THEN 'occupied'
                       ELSE 'available'
                   END as status
                   FROM tables t
                   LEFT JOIN orders o ON t.id = o.table_id AND o.status != 'completed'
                   WHERE t.id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $tableId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in TableController::getTableById: " . $e->getMessage());
            throw new Exception("Failed to fetch table");
        }
    }

    public function createTable($number, $floor) {
        try {
            // Check if table number already exists on the same floor
            $sql = "SELECT id FROM tables WHERE number = :number AND floor = :floor";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':number' => $number,
                ':floor' => $floor
            ]);
            if ($stmt->fetch()) {
                throw new Exception("Table number already exists on this floor");
            }

            // Create new table (status will be determined by active orders)
            $sql = "INSERT INTO tables (number, floor) VALUES (:number, :floor)";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':number' => $number,
                ':floor' => $floor
            ]);
            return $this->db->lastInsertId();
        } catch (Exception $e) {
            error_log("Error in TableController::createTable: " . $e->getMessage());
            throw new Exception("Failed to create table");
        }
    }

    public function updateTable($tableId, $data) {
        try {
            $allowedFields = ['number', 'floor'];
            $updates = [];
            $params = [':id' => $tableId];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }
            
            if (empty($updates)) {
                throw new Exception("No valid fields to update");
            }
            
            $sql = "UPDATE tables SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $this->getTableById($tableId);
        } catch (Exception $e) {
            error_log("Error in TableController::updateTable: " . $e->getMessage());
            throw new Exception("Failed to update table");
        }
    }

    public function updateTableStatus($tableId, $status) {
        try {
            // For setting a table as available, we need to mark any active orders as completed
            if ($status === 'available') {
                $sql = "UPDATE orders SET status = 'completed' WHERE table_id = :table_id AND status != 'completed'";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':table_id' => $tableId]);
            }
            
            // Return the updated table
            return $this->getTableById($tableId);
        } catch (Exception $e) {
            error_log("Error in TableController::updateTableStatus: " . $e->getMessage());
            throw new Exception("Failed to update table status");
        }
    }

    public function deleteTable($tableId) {
        try {
            // Check if table has any orders
            $sql = "SELECT COUNT(*) FROM orders WHERE table_id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $tableId]);
            if ($stmt->fetchColumn() > 0) {
                throw new Exception("Cannot delete table with existing orders");
            }
            
            $sql = "DELETE FROM tables WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $tableId]);
            
            return true;
        } catch (Exception $e) {
            error_log("Error in TableController::deleteTable: " . $e->getMessage());
            throw new Exception("Failed to delete table");
        }
    }
}

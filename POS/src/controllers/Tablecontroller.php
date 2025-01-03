<?php
// src/controllers/TableController.php
class TableController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getTableById($id) {
        try {
            $sql = "SELECT * FROM tables WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getTableById: " . $e->getMessage());
            throw new Exception("Failed to get table: " . $e->getMessage());
        }
    }

    public function getAllTables() {
        try {
            $sql = "SELECT * FROM tables ORDER BY floor, number";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public function getTablesByFloor($floor) {
        try {
            $sql = "SELECT * FROM tables WHERE floor = :floor ORDER BY number";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':floor' => $floor]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return [];
        }
    }

    public function updateTableStatus($id, $status) {
        try {
            $sql = "UPDATE tables SET status = :status WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([
                ':id' => $id,
                ':status' => $status
            ]);
        } catch (Exception $e) {
            error_log($e->getMessage());
            return false;
        }
    }
}
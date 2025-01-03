<?php
require_once __DIR__ . '/../config/Database.php';

class CategoryController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAllCategories() {
        try {
            $sql = "SELECT * FROM categories ORDER BY display_order, name";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (Exception $e) {
            error_log("Error in getAllCategories: " . $e->getMessage());
            throw new Exception("Failed to get categories: " . $e->getMessage());
        }
    }

    public function getCategoryById($id) {
        try {
            $sql = "SELECT * FROM categories WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            return $stmt->fetch();
        } catch (Exception $e) {
            error_log("Error in getCategoryById: " . $e->getMessage());
            throw new Exception("Failed to get category: " . $e->getMessage());
        }
    }
}

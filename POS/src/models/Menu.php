<?php
class Menu {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getCategories() {
        $result = $this->db->query(
            "SELECT * FROM categories ORDER BY display_order"
        );
        return $this->db->fetchAll($result);
    }

    public function getItemsByCategory($categoryId) {
        $result = $this->db->query(
            "SELECT * FROM menu_items WHERE category_id = :category_id AND status = 'available'",
            [':category_id' => $categoryId]
        );
        return $this->db->fetchAll($result);
    }

    public function getItemOptions($itemId) {
        $result = $this->db->query(
            "SELECT io.*, ov.* FROM item_options io 
             LEFT JOIN option_values ov ON ov.option_id = io.id 
             WHERE io.menu_item_id = :item_id",
            [':item_id' => $itemId]
        );
        return $this->db->fetchAll($result);
    }
}
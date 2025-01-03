<?php
class ProductController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function getAllProducts() {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                    FROM products p 
                    JOIN categories c ON p.category_id = c.id 
                    WHERE p.status = 'available' 
                    ORDER BY c.display_order, c.name, p.name";
            $result = $this->db->query($sql);
            $items = $this->db->fetchAll($result);
            return $this->addOptionsToItems($items);
        } catch (Exception $e) {
            error_log("Error in getAllProducts: " . $e->getMessage());
            throw new Exception("Failed to get products: " . $e->getMessage());
        }
    }

    public function getProductsByCategory($categoryId) {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                    FROM products p 
                    JOIN categories c ON p.category_id = c.id 
                    WHERE p.category_id = :category_id 
                    AND p.status = 'available' 
                    ORDER BY p.name";
            $result = $this->db->query($sql, [':category_id' => $categoryId]);
            $items = $this->db->fetchAll($result);
            return $this->addOptionsToItems($items);
        } catch (Exception $e) {
            error_log("Error in getProductsByCategory: " . $e->getMessage());
            throw new Exception("Failed to get products: " . $e->getMessage());
        }
    }

    public function searchProducts($searchTerm) {
        try {
            $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                    FROM products p 
                    JOIN categories c ON p.category_id = c.id 
                    WHERE p.status = 'available' 
                    AND (p.name LIKE :search 
                        OR p.description LIKE :search 
                        OR c.name LIKE :search)
                    ORDER BY c.display_order, c.name, p.name";
            $result = $this->db->query($sql, [':search' => "%{$searchTerm}%"]);
            $items = $this->db->fetchAll($result);
            return $this->addOptionsToItems($items);
        } catch (Exception $e) {
            error_log("Error in searchProducts: " . $e->getMessage());
            throw new Exception("Failed to search products: " . $e->getMessage());
        }
    }

    private function addOptionsToItems($items) {
        if (empty($items)) {
            return $items;
        }

        $itemIds = array_column($items, 'id');
        $itemIdsStr = implode(',', $itemIds);

        try {
            // Get all options and their values for these items
            $sql = "SELECT io.product_id, io.option_name, io.option_type,
                           ov.id as value_id, ov.value, ov.extra_cost
                    FROM item_options io
                    LEFT JOIN option_values ov ON ov.option_id = io.id
                    WHERE io.product_id IN ($itemIdsStr)
                    ORDER BY io.product_id, io.option_type, ov.value";
            
            $result = $this->db->query($sql);
            $options = $this->db->fetchAll($result);

            // Group options by product
            $itemOptions = [];
            foreach ($options as $option) {
                $itemId = $option['product_id'];
                if (!isset($itemOptions[$itemId])) {
                    $itemOptions[$itemId] = [];
                }
                
                $optionName = $option['option_name'];
                if (!isset($itemOptions[$itemId][$optionName])) {
                    $itemOptions[$itemId][$optionName] = [
                        'type' => $option['option_type'],
                        'values' => []
                    ];
                }

                if ($option['value_id']) {
                    $itemOptions[$itemId][$optionName]['values'][] = [
                        'id' => $option['value_id'],
                        'value' => $option['value'],
                        'extra_cost' => $option['extra_cost']
                    ];
                }
            }

            // Add options to each item
            foreach ($items as &$item) {
                $item['options'] = $itemOptions[$item['id']] ?? [];
            }

            return $items;
        } catch (Exception $e) {
            error_log("Error in addOptionsToItems: " . $e->getMessage());
            // Return items without options if there's an error
            return $items;
        }
    }
}

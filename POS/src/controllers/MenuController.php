<?php
class MenuController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    // Get all categories
    public function getAllCategories() {
        try {
            $sql = "SELECT id, name, display_order FROM categories ORDER BY display_order";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getAllCategories: " . $e->getMessage());
            throw new Exception("Failed to get categories");
        }
    }

    // Get menu item options
    private function getMenuItemOptions($itemId) {
        try {
            // Get options
            $sql = "SELECT io.*, ov.id as value_id, ov.value, ov.extra_cost 
                   FROM item_options io 
                   LEFT JOIN option_values ov ON io.id = ov.option_id 
                   WHERE io.menu_item_id = :item_id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':item_id' => $itemId]);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Group options and their values
            $options = [];
            foreach ($rows as $row) {
                $optionId = $row['id'];
                if (!isset($options[$optionId])) {
                    $options[$optionId] = [
                        'id' => $optionId,
                        'name' => $row['option_name'],
                        'type' => $row['option_type'],
                        'values' => []
                    ];
                }
                if ($row['value_id']) {
                    $options[$optionId]['values'][] = [
                        'id' => $row['value_id'],
                        'value' => $row['value'],
                        'extra_cost' => $row['extra_cost']
                    ];
                }
            }
            return array_values($options);
        } catch (Exception $e) {
            error_log("Error in getMenuItemOptions: " . $e->getMessage());
            return [];
        }
    }

    // Get all menu items with their options
    public function getAllMenuItems() {
        try {
            $sql = "SELECT mi.*, c.name as category_name 
                   FROM menu_items mi 
                   JOIN categories c ON mi.category_id = c.id 
                   WHERE mi.status = 'available' 
                   ORDER BY c.display_order, mi.name";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add options to each item
            foreach ($items as &$item) {
                $item['options'] = $this->getMenuItemOptions($item['id']);
            }

            return $items;
        } catch (Exception $e) {
            error_log("Error in getAllMenuItems: " . $e->getMessage());
            throw new Exception("Failed to get menu items");
        }
    }

    // Get menu items by category with their options
    public function getMenuItemsByCategory($categoryId) {
        try {
            $sql = "SELECT mi.*, c.name as category_name 
                   FROM menu_items mi 
                   JOIN categories c ON mi.category_id = c.id 
                   WHERE mi.category_id = :category_id 
                   AND mi.status = 'available' 
                   ORDER BY mi.name";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':category_id' => $categoryId]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Add options to each item
            foreach ($items as &$item) {
                $item['options'] = $this->getMenuItemOptions($item['id']);
            }

            return $items;
        } catch (Exception $e) {
            error_log("Error in getMenuItemsByCategory: " . $e->getMessage());
            throw new Exception("Failed to get menu items for category");
        }
    }

    public function addMenuItem($name, $category_id, $price, $description = '', $options = []) {
        try {
            $this->db->beginTransaction();
            
            // Insert menu item
            $sql = "INSERT INTO menu_items (category_id, name, price, description, status) 
                    VALUES (:category_id, :name, :price, :description, 'available')";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':category_id' => $category_id,
                ':name' => $name,
                ':price' => $price,
                ':description' => $description
            ]);
            
            $itemId = $this->db->lastInsertId();
            
            // Add options if provided
            if (!empty($options)) {
                foreach ($options as $option) {
                    // Insert option
                    $sql = "INSERT INTO item_options (menu_item_id, option_name, option_type) 
                           VALUES (:menu_item_id, :option_name, :option_type)";
                    $stmt = $this->db->prepare($sql);
                    $stmt->execute([
                        ':menu_item_id' => $itemId,
                        ':option_name' => $option['option_name'],
                        ':option_type' => $option['option_type']
                    ]);
                    
                    $optionId = $this->db->lastInsertId();
                    
                    // Insert values for this option
                    if (!empty($option['values'])) {
                        $sql = "INSERT INTO option_values (option_id, value, extra_cost) 
                               VALUES (:option_id, :value, :extra_cost)";
                        $stmt = $this->db->prepare($sql);
                        
                        foreach ($option['values'] as $value) {
                            $stmt->execute([
                                ':option_id' => $optionId,
                                ':value' => $value['value'],
                                ':extra_cost' => $value['extra_cost']
                            ]);
                        }
                    }
                }
            }
            
            $this->db->commit();
            return $itemId;
            
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error in addMenuItem: " . $e->getMessage());
            throw new Exception("Failed to add menu item: " . $e->getMessage());
        }
    }

    public function updateMenuItem($id, $name, $category_id, $price, $description = '') {
        try {
            $this->db->beginTransaction();
            
            $sql = "UPDATE menu_items 
                    SET name = :name,
                        category_id = :category_id,
                        price = :price,
                        description = :description
                    WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $result = $stmt->execute([
                ':id' => $id,
                ':name' => $name,
                ':category_id' => $category_id,
                ':price' => $price,
                ':description' => $description
            ]);
            
            if (!$result) {
                throw new Exception("No menu item found with ID: $id");
            }
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Error in updateMenuItem: " . $e->getMessage());
            throw new Exception("Failed to update menu item");
        }
    }

    public function deleteMenuItem($id) {
        try {
            $this->db->beginTransaction();
            
            // Check if item exists and get its current status
            $checkSql = "SELECT id, status FROM menu_items WHERE id = :id";
            $checkStmt = $this->db->prepare($checkSql);
            $checkStmt->execute([':id' => $id]);
            $item = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$item) {
                throw new Exception("No menu item found with ID: $id");
            }
            
            // Check if item is referenced in order_items
            $orderCheckSql = "SELECT COUNT(*) as count FROM order_items WHERE menu_item_id = :id";
            $orderCheckStmt = $this->db->prepare($orderCheckSql);
            $orderCheckStmt->execute([':id' => $id]);
            $orderCount = $orderCheckStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            if ($orderCount > 0) {
                // If item is in orders, just mark it as unavailable
                $sql = "UPDATE menu_items SET status = 'unavailable' WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $result = $stmt->execute([':id' => $id]);
                
                if (!$result) {
                    throw new Exception("Failed to update menu item status");
                }
            } else {
                // Delete option values first
                $sql = "DELETE ov FROM option_values ov 
                       INNER JOIN item_options io ON ov.option_id = io.id 
                       WHERE io.menu_item_id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':id' => $id]);

                // Delete item options
                $sql = "DELETE FROM item_options WHERE menu_item_id = :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':id' => $id]);
                
                // Finally delete the menu item
                $sql = "DELETE FROM menu_items WHERE id = :id";
                $stmt = $this->db->prepare($sql);
                $result = $stmt->execute([':id' => $id]);
                
                if (!$result) {
                    throw new Exception("Failed to delete menu item");
                }
            }
            
            $this->db->commit();
            return true;
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Error in deleteMenuItem: " . $e->getMessage());
            throw new Exception("Failed to delete menu item: " . $e->getMessage());
        }
    }

    public function getMenuWithItems() {
        try {
            // Get all categories with items
            $sql = "SELECT c.id as category_id, 
                           c.name as category_name,
                           m.id as item_id,
                           m.name as item_name,
                           m.price as item_price,
                           m.description as item_description,
                           m.status as item_status
                    FROM categories c
                    LEFT JOIN menu_items m ON c.id = m.category_id
                    ORDER BY c.display_order, m.name";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Group by category
            $menu = [];
            foreach ($results as $row) {
                $categoryId = $row['category_id'];
                $categoryName = $row['category_name'];
                
                if (!isset($menu[$categoryId])) {
                    $menu[$categoryId] = [
                        'id' => $categoryId,
                        'name' => $categoryName,
                        'items' => []
                    ];
                }
                
                // Only add item if it exists (not null from LEFT JOIN)
                if ($row['item_id']) {
                    $menu[$categoryId]['items'][] = [
                        'id' => $row['item_id'],
                        'name' => $row['item_name'],
                        'price' => (float)$row['item_price'],
                        'description' => $row['item_description'],
                        'status' => $row['item_status']
                    ];
                }
            }
            
            return array_values($menu);
        } catch (Exception $e) {
            error_log("Error in getMenuWithItems: " . $e->getMessage());
            throw new Exception("Failed to get menu items");
        }
    }

    private function getItemOptions($itemId) {
        try {
            // First get all options for the item
            $sql = "SELECT * FROM item_options WHERE menu_item_id = :itemId";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':itemId' => $itemId]);
            $options = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Then get values for each option
            foreach ($options as &$option) {
                $sql = "SELECT * FROM option_values WHERE option_id = :optionId";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':optionId' => $option['id']]);
                $option['values'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            }

            return $options;
        } catch (Exception $e) {
            error_log("Error in MenuController::getItemOptions: " . $e->getMessage());
            return [];
        }
    }

    public function getAllItems() {
        try {
            // Get menu items with their categories
            $sql = "SELECT m.*, c.name as category_name 
                   FROM menu_items m 
                   LEFT JOIN categories c ON m.category_id = c.id 
                   WHERE m.status = 'available' 
                   ORDER BY m.category_id, m.name";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Get options for each item
            foreach ($items as &$item) {
                $item['options'] = $this->getItemOptions($item['id']);
            }

            return $items;
        } catch (Exception $e) {
            error_log("Error in MenuController::getAllItems: " . $e->getMessage());
            throw new Exception("Failed to fetch menu items");
        }
    }

    public function getItemById($id) {
        try {
            $sql = "SELECT m.*, c.name as category_name 
                   FROM menu_items m 
                   LEFT JOIN categories c ON m.category_id = c.id 
                   WHERE m.id = :id AND m.status = 'available'";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($item) {
                $item['options'] = $this->getItemOptions($item['id']);
            }

            return $item;
        } catch (Exception $e) {
            error_log("Error in MenuController::getItemById: " . $e->getMessage());
            throw new Exception("Failed to fetch menu item");
        }
    }

    public function createItem($data) {
        try {
            $this->db->beginTransaction();

            // Insert menu item
            $sql = "INSERT INTO menu_items (name, description, price, category_id, status) 
                   VALUES (:name, :description, :price, :category_id, 'available')";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':name' => $data['name'],
                ':description' => $data['description'] ?? null,
                ':price' => $data['price'],
                ':category_id' => $data['category_id']
            ]);

            $itemId = $this->db->lastInsertId();

            // Insert options if provided
            if (!empty($data['options'])) {
                foreach ($data['options'] as $option) {
                    // Insert option
                    $sql = "INSERT INTO item_options (menu_item_id, option_name, option_type) 
                           VALUES (:item_id, :option_name, :option_type)";
                    
                    $stmt = $this->db->prepare($sql);
                    $stmt->execute([
                        ':item_id' => $itemId,
                        ':option_name' => $option['option_name'],
                        ':option_type' => $option['option_type']
                    ]);

                    $optionId = $this->db->lastInsertId();

                    // Insert option values
                    if (!empty($option['values'])) {
                        foreach ($option['values'] as $value) {
                            $sql = "INSERT INTO option_values (option_id, value, extra_cost) 
                                   VALUES (:option_id, :value, :extra_cost)";
                            
                            $stmt = $this->db->prepare($sql);
                            $stmt->execute([
                                ':option_id' => $optionId,
                                ':value' => $value['value'],
                                ':extra_cost' => $value['extra_cost'] ?? 0
                            ]);
                        }
                    }
                }
            }

            $this->db->commit();
            return $this->getItemById($itemId);
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error in MenuController::createItem: " . $e->getMessage());
            throw new Exception("Failed to create menu item");
        }
    }

    public function updateItem($id, $data) {
        try {
            $this->db->beginTransaction();

            // Update menu item
            $sql = "UPDATE menu_items SET 
                   name = :name,
                   description = :description,
                   price = :price,
                   category_id = :category_id
                   WHERE id = :id";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':id' => $id,
                ':name' => $data['name'],
                ':description' => $data['description'] ?? null,
                ':price' => $data['price'],
                ':category_id' => $data['category_id']
            ]);

            // Update options if provided
            if (isset($data['options'])) {
                // Delete existing options and their values
                $sql = "DELETE ov FROM option_values ov 
                       INNER JOIN item_options io ON ov.option_id = io.id 
                       WHERE io.menu_item_id = :item_id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':item_id' => $id]);

                $sql = "DELETE FROM item_options WHERE menu_item_id = :item_id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':item_id' => $id]);

                // Insert new options
                foreach ($data['options'] as $option) {
                    $sql = "INSERT INTO item_options (menu_item_id, option_name, option_type) 
                           VALUES (:item_id, :option_name, :option_type)";
                    
                    $stmt = $this->db->prepare($sql);
                    $stmt->execute([
                        ':item_id' => $id,
                        ':option_name' => $option['option_name'],
                        ':option_type' => $option['option_type']
                    ]);

                    $optionId = $this->db->lastInsertId();

                    // Insert option values
                    if (!empty($option['values'])) {
                        foreach ($option['values'] as $value) {
                            $sql = "INSERT INTO option_values (option_id, value, extra_cost) 
                                   VALUES (:option_id, :value, :extra_cost)";
                            
                            $stmt = $this->db->prepare($sql);
                            $stmt->execute([
                                ':option_id' => $optionId,
                                ':value' => $value['value'],
                                ':extra_cost' => $value['extra_cost'] ?? 0
                            ]);
                        }
                    }
                }
            }

            $this->db->commit();
            return $this->getItemById($id);
        } catch (Exception $e) {
            $this->db->rollBack();
            error_log("Error in MenuController::updateItem: " . $e->getMessage());
            throw new Exception("Failed to update menu item");
        }
    }

    public function deleteItem($id) {
        try {
            // Soft delete by setting status = 'unavailable'
            $sql = "UPDATE menu_items SET status = 'unavailable' WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':id' => $id]);
        } catch (Exception $e) {
            error_log("Error in MenuController::deleteItem: " . $e->getMessage());
            throw new Exception("Failed to delete menu item");
        }
    }
}
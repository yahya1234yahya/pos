<?php
class User {
    private $db;

    public function __construct($db = null) {
        $this->db = $db ?: Database::getInstance();
    }

    public function authenticate($rfid) {
        try {
            $sql = "SELECT * FROM users WHERE rfid = :rfid AND status = 'active'";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':rfid' => $rfid]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in authenticate: " . $e->getMessage());
            return null;
        }
    }

    public function findById($id) {
        try {
            $sql = "SELECT * FROM users WHERE id = :id AND status = 'active'";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in findById: " . $e->getMessage());
            return null;
        }
    }

    public function getAllUsers() {
        try {
            $sql = "SELECT id, name, role, rfid, floor, status FROM users ORDER BY role, name";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getAllUsers: " . $e->getMessage());
            return [];
        }
    }

    public function getAllWaiters() {
        try {
            $sql = "SELECT * FROM users WHERE role = 'waiter' AND status = 'active'";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error in getAllWaiters: " . $e->getMessage());
            return [];
        }
    }

    public function createUser($data) {
        try {
            $this->db->beginTransaction();

            // Check if RFID already exists
            if (!isset($data['rfid']) || empty($data['rfid'])) {
                throw new Exception("RFID is required");
            }

            $sql = "SELECT id FROM users WHERE rfid = :rfid";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':rfid' => $data['rfid']]);
            if ($stmt->fetch()) {
                throw new Exception("RFID card already assigned to another user");
            }

            $sql = "INSERT INTO users (name, role, rfid, floor, status) 
                    VALUES (:name, :role, :rfid, :floor, 'active')";
            
            $params = [
                ':name' => $data['name'] ?? null,
                ':role' => $data['role'],
                ':rfid' => $data['rfid'],
                ':floor' => $data['floor'] ?? null
            ];

            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            $userId = $this->db->lastInsertId();
            $this->db->commit();
            
            return $this->findById($userId);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Error in createUser: " . $e->getMessage());
            throw $e;
        }
    }

    public function updateUser($id, $data) {
        try {
            $this->db->beginTransaction();

            // Check if RFID already exists for other users
            if (isset($data['rfid']) && !empty($data['rfid'])) {
                $sql = "SELECT id FROM users WHERE rfid = :rfid AND id != :id";
                $stmt = $this->db->prepare($sql);
                $stmt->execute([':rfid' => $data['rfid'], ':id' => $id]);
                if ($stmt->fetch()) {
                    throw new Exception("RFID card already assigned to another user");
                }
            }

            $updates = [];
            $params = [':id' => $id];

            // Build dynamic update query
            foreach (['name', 'role', 'rfid', 'floor', 'status'] as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (empty($updates)) {
                throw new Exception("No fields to update");
            }

            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);

            $this->db->commit();
            return $this->findById($id);
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("Error in updateUser: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteUser($id) {
        try {
            // Check if user exists
            $user = $this->findById($id);
            if (!$user) {
                throw new Exception("User not found");
            }

            // Instead of deleting, mark as inactive
            return $this->updateUser($id, ['status' => 'inactive']);
        } catch (Exception $e) {
            error_log("Error in deleteUser: " . $e->getMessage());
            throw $e;
        }
    }
}
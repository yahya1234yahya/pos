<?php
require_once __DIR__ . '/../config/Database.php';

class UserController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance();
    }

    public function login($username, $password) {
        try {
            $sql = "SELECT id, name, role, password FROM users WHERE name = :username AND status = 'active'";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':username' => $username]);
            $user = $stmt->fetch();

            if (!$user) {
                return ['success' => false, 'message' => 'User not found'];
            }

            // For now, we'll use simple password comparison since we don't have hashed passwords yet
            // In production, you should use password_hash and password_verify
            if ($password === $user['password']) {
                // Remove password from user array before returning
                unset($user['password']);
                return ['success' => true, 'user' => $user];
            }

            return ['success' => false, 'message' => 'Invalid credentials'];
        } catch (Exception $e) {
            error_log("Error in login: " . $e->getMessage());
            throw new Exception("Login failed: " . $e->getMessage());
        }
    }

    // Create Method
    public function createUser($data) {
        try {
            $sql = "INSERT INTO users (rfid, name, role, floor, status, password)
                    VALUES (:rfid, :name, :role, :floor, :status, :password)";
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute([
                ':rfid' => $data['rfid'] ?? null,
                ':name' => $data['name'],
                ':role' => $data['role'],
                ':floor' => $data['floor'] ?? null,
                ':status' => $data['status'] ?? 'active',
                ':password' => $data['password'] ?? '123456' // Default password, should be hashed in production
            ]);

            return $this->db->lastInsertId();
        } catch (Exception $e) {
            error_log("Error in createUser: " . $e->getMessage());
            throw new Exception("Failed to create user: " . $e->getMessage());
        }
    }

    // Read Methods
    public function getAllUsers() {
        try {
            $sql = "SELECT id, name, role, floor, status FROM users ORDER BY name";
            $stmt = $this->db->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } catch (Exception $e) {
            error_log("Error in getAllUsers: " . $e->getMessage());
            throw new Exception("Failed to get users: " . $e->getMessage());
        }
    }

    public function getUserById($id) {
        try {
            $sql = "SELECT * FROM users WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':id' => $id]);
            return $stmt->fetch();
        } catch (Exception $e) {
            error_log("Error in getUserById: " . $e->getMessage());
            throw new Exception("Failed to get user: " . $e->getMessage());
        }
    }

    public function getUserByRFID($rfid) {
        try {
            $sql = "SELECT * FROM users WHERE rfid = :rfid AND status = 'active'";
            $stmt = $this->db->prepare($sql);
            $stmt->execute([':rfid' => $rfid]);
            $user = $stmt->fetch();
            
            if ($user) {
                // Remove sensitive data
                unset($user['password']);
                unset($user['created_at']);
                unset($user['updated_at']);
            }
            
            return $user;
        } catch (Exception $e) {
            error_log("Error in getUserByRFID: " . $e->getMessage());
            throw new Exception("Failed to get user by RFID: " . $e->getMessage());
        }
    }

    // Update Methods
    public function updateUser($id, $data) {
        try {
            $updates = [];
            $params = [':id' => $id];

            foreach (['rfid', 'name', 'role', 'floor', 'status', 'password'] as $field) {
                if (isset($data[$field])) {
                    $updates[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }

            if (empty($updates)) {
                return true; // Nothing to update
            }

            $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute($params);
        } catch (Exception $e) {
            error_log("Error in updateUser: " . $e->getMessage());
            throw new Exception("Failed to update user: " . $e->getMessage());
        }
    }

    // Delete Method (soft delete by updating status)
    public function deleteUser($id) {
        try {
            $sql = "UPDATE users SET status = 'inactive' WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            return $stmt->execute([':id' => $id]);
        } catch (Exception $e) {
            error_log("Error in deleteUser: " . $e->getMessage());
            throw new Exception("Failed to delete user: " . $e->getMessage());
        }
    }
}
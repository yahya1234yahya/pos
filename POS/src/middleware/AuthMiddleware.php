<?php
class AuthMiddleware {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function isValidSession() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Check if user is logged in
        if (!isset($_SESSION['user_id'])) {
            return false;
        }

        try {
            // Verify user exists in database
            $query = "SELECT id, role FROM users WHERE id = :user_id AND status = 'active'";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $_SESSION['user_id']);
            $stmt->execute();

            if ($stmt->rowCount() === 0) {
                return false;
            }

            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Verify role is valid
            $role = strtolower($user['role']);
            if (!in_array($role, ['manager', 'admin', 'waiter', 'kitchen'])) {
                return false;
            }

            return true;
        } catch (Exception $e) {
            error_log("Error in AuthMiddleware: " . $e->getMessage());
            return false;
        }
    }
}

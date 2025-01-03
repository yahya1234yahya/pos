-- Default admin user (password: admin123)
INSERT INTO users (username, password, name, role, status) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin', 'active');

-- Default manager (password: manager123)
INSERT INTO users (username, password, name, role, status) VALUES 
('manager', '$2y$10$JGc3Z.1HAHHGo0Y1r9wHxOhpzT3XFJDgZ9LhC6YwYqxFEJsOSrTAG', 'Manager', 'manager', 'active');

-- Default waiter with RFID
INSERT INTO users (rfid, name, role, floor, status) VALUES 
('1234567890', 'John Waiter', 'waiter', 1, 'active');

-- Default kitchen staff with username/password (password: kitchen123)
INSERT INTO users (username, password, name, role, status) VALUES 
('kitchen', '$2y$10$wOvH8u9FwMRxs.g0LKwlYO9CV99/RqFx9VCmDG.HpiFNk5HH94VD6', 'Kitchen Staff', 'kitchen', 'active');

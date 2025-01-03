ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'preparing', 'ready', 'eating', 'payment', 'completed', 'cancelled') NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN notes TEXT AFTER type;

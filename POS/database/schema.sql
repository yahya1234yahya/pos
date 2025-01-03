-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    rfid VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('waiter', 'kitchen', 'admin', 'manager') NOT NULL,
    floor INTEGER,
    status VARCHAR(50) DEFAULT 'active'
) ENGINE=InnoDB;

-- Tables management
CREATE TABLE tables (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    number VARCHAR(50) NOT NULL,
    floor INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'available'
) ENGINE=InnoDB;

-- Menu categories
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    display_order INTEGER
) ENGINE=InnoDB;

-- Menu items
CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    category_id INTEGER,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'available',
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

-- Item options
CREATE TABLE item_options (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    menu_item_id INTEGER,
    option_name VARCHAR(255) NOT NULL,
    option_type ENUM('size', 'extra', 'variant') NOT NULL,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
) ENGINE=InnoDB;

-- Option values
CREATE TABLE option_values (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    option_id INTEGER,
    value VARCHAR(255) NOT NULL,
    extra_cost DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (option_id) REFERENCES item_options(id)
) ENGINE=InnoDB;

-- Orders
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    table_id INTEGER,
    waiter_id INTEGER,
    status ENUM('pending', 'preparing', 'ready', 'eating', 'payment', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    type ENUM('dine-in', 'takeout') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    total_amount DECIMAL(10,2),
    FOREIGN KEY (table_id) REFERENCES tables(id),
    FOREIGN KEY (waiter_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Order items
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    order_id INTEGER,
    menu_item_id INTEGER,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
) ENGINE=InnoDB;

-- Order item customizations
CREATE TABLE order_item_options (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    order_item_id INTEGER,
    option_value_id INTEGER,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (option_value_id) REFERENCES option_values(id)
) ENGINE=InnoDB;
import mysql.connector
from faker import Faker
from datetime import datetime, timedelta
import random

# Initialize Faker
fake = Faker()

# Connect to MySQL database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='your_password',
    database='pos_system'
)
cursor = conn.cursor()

# Helper function to insert and get last id
def insert_and_get_id(query, values):
    cursor.execute(query, values)
    return cursor.lastrowid

# 1. Seed Users
roles = ['waiter', 'kitchen', 'admin']
users = []
for _ in range(10):
    user_id = insert_and_get_id(
        "INSERT INTO users (rfid, name, role, floor, status) VALUES (%s, %s, %s, %s, %s)",
        (
            fake.uuid4()[:8],
            fake.name(),
            random.choice(roles),
            random.randint(1, 3),
            'active'
        )
    )
    users.append(user_id)

# 2. Seed Tables
tables = []
for floor in range(1, 4):
    for num in range(1, 11):
        table_id = insert_and_get_id(
            "INSERT INTO tables (number, floor, status) VALUES (%s, %s, %s)",
            (f"{floor}-{num}", floor, 'available')
        )
        tables.append(table_id)

# 3. Seed Categories
categories = [
    "Hot Drinks",
    "Cold Drinks",
    "Breakfast",
    "Main Course",
    "Desserts"
]
category_ids = []
for i, cat in enumerate(categories):
    cat_id = insert_and_get_id(
        "INSERT INTO categories (name, display_order) VALUES (%s, %s)",
        (cat, i + 1)
    )
    category_ids.append(cat_id)

# 4. Seed Menu Items
menu_items = []
items_per_category = {
    "Hot Drinks": ["Espresso", "Cappuccino", "Latte", "Americano"],
    "Cold Drinks": ["Iced Coffee", "Lemonade", "Iced Tea", "Smoothie"],
    "Breakfast": ["Pancakes", "Eggs Benedict", "Omelette", "French Toast"],
    "Main Course": ["Burger", "Pasta", "Steak", "Salad"],
    "Desserts": ["Cheesecake", "Ice Cream", "Apple Pie", "Brownie"]
}

for cat_id, cat_name in zip(category_ids, categories):
    for item_name in items_per_category[cat_name]:
        item_id = insert_and_get_id(
            "INSERT INTO menu_items (category_id, name, price, description, status) VALUES (%s, %s, %s, %s, %s)",
            (
                cat_id,
                item_name,
                round(random.uniform(5, 30), 2),
                fake.sentence(),
                'available'
            )
        )
        menu_items.append(item_id)

# 5. Seed Item Options
option_types = ['size', 'extra', 'variant']
item_options = []
for menu_item in menu_items:
    for _ in range(random.randint(0, 3)):
        option_id = insert_and_get_id(
            "INSERT INTO item_options (menu_item_id, option_name, option_type) VALUES (%s, %s, %s)",
            (
                menu_item,
                fake.word(),
                random.choice(option_types)
            )
        )
        item_options.append(option_id)

# 6. Seed Option Values
option_values = []
for option in item_options:
    for _ in range(random.randint(2, 4)):
        value_id = insert_and_get_id(
            "INSERT INTO option_values (option_id, value, extra_cost) VALUES (%s, %s, %s)",
            (
                option,
                fake.word(),
                round(random.uniform(0, 5), 2)
            )
        )
        option_values.append(value_id)

# 7. Seed Orders
orders = []
for _ in range(50):
    created_at = fake.date_time_between(start_date='-7d', end_date='now')
    completed_at = created_at + timedelta(minutes=random.randint(15, 120)) if random.random() > 0.3 else None
    
    order_id = insert_and_get_id(
        "INSERT INTO orders (table_id, waiter_id, status, type, created_at, completed_at, total_amount) VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (
            random.choice(tables),
            random.choice(users),
            random.choice(['pending', 'preparing', 'ready', 'served', 'paid']),
            random.choice(['dine-in', 'takeout']),
            created_at,
            completed_at,
            0  # Will update after adding items
        )
    )
    orders.append(order_id)

# 8. Seed Order Items
order_items = []
for order in orders:
    total = 0
    for _ in range(random.randint(1, 5)):
        quantity = random.randint(1, 3)
        unit_price = round(random.uniform(5, 30), 2)
        total += quantity * unit_price
        
        item_id = insert_and_get_id(
            "INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, notes) VALUES (%s, %s, %s, %s, %s)",
            (
                order,
                random.choice(menu_items),
                quantity,
                unit_price,
                fake.sentence() if random.random() > 0.7 else None
            )
        )
        order_items.append(item_id)
    
    # Update order total
    cursor.execute("UPDATE orders SET total_amount = %s WHERE id = %s", (total, order))
    conn.commit()

# 9. Seed Order Item Options
for order_item in order_items:
    if random.random() > 0.5:
        insert_and_get_id(
            "INSERT INTO order_item_options (order_item_id, option_value_id) VALUES (%s, %s)",
            (
                order_item,
                random.choice(option_values)
            )
        )

# Commit and close
conn.commit()
cursor.close()
conn.close()

print("Database seeded successfully!")
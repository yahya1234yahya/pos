// State management
const state = {
    currentView: 'new-order',
    categories: [],
    products: [],
    currentOrder: {
        items: [],
        total: 0,
        tax: 0
    },
    activeOrders: [],
    finishedOrders: []
};

// API interface
const api = {
    async getCategories() {
        const response = await fetch('http://localhost:8000/api/menu.php');
        const data = await response.json();
        return data.categories;
    },

    async getProducts() {
        const response = await fetch('/api/menu.php');
        const data = await response.json();
        return data.items;
    },

    async createOrder(orderData) {
        const response = await fetch('http://localhost:8000/api/orders.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return response.json();
    },

    async getOrders(status) {
        const response = await fetch(`http://localhost:8000/api/orders.php?status=${status}`);
        return response.json();
    },

    async updateOrderStatus(orderId, status) {
        const response = await fetch('http://localhost:8000/api/orders.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: orderId, status })
        });
        return response.json();
    }
};

// UI Controllers
const ui = {
    showView(viewId) {
        document.querySelectorAll('.view-container').forEach(view => {
            view.classList.add('hidden');
        });
        document.getElementById(`${viewId}-view`).classList.remove('hidden');
        
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
    },

    updateCategories(categories) {
        const container = document.getElementById('categories-list');
        container.innerHTML = categories.map(category => `
            <button class="category-btn" data-id="${category.id}">
                ${category.name}
            </button>
        `).join('');
    },

    updateProducts(products) {
        const container = document.getElementById('products-grid');
        container.innerHTML = products.map(product => `
            <div class="product-card" data-id="${product.id}">
                <h3 class="text-xl font-bold">${product.name}</h3>
                <p class="text-gray-600">${product.description}</p>
                <p class="text-xl text-blue-600 font-bold mt-2">$${product.price.toFixed(2)}</p>
            </div>
        `).join('');
    },

    updateOrderItems() {
        const container = document.getElementById('order-items');
        container.innerHTML = state.currentOrder.items.map(item => `
            <div class="order-item">
                <div>
                    <span class="font-bold">${item.quantity}x</span>
                    <span>${item.name}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    <button class="remove-item" data-id="${item.id}">×</button>
                </div>
            </div>
        `).join('');
    },

    updateOrderSummary() {
        const subtotal = state.currentOrder.total;
        const tax = subtotal * 0.1;
        const total = subtotal + tax;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
        document.getElementById('payment-total').textContent = `$${total.toFixed(2)}`;
    },

    updateActiveOrders(orders) {
        const container = document.getElementById('active-orders-grid');
        container.innerHTML = orders.map(order => `
            <div class="bg-white rounded-lg shadow-lg p-4">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">Order #${order.id}</h3>
                    <span class="badge badge-${order.status}">${order.status}</span>
                </div>
                <div class="space-y-2">
                    ${order.items.map(item => `
                        <div class="flex justify-between">
                            <span>${item.quantity}x ${item.name}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-4 pt-4 border-t">
                    <div class="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>$${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
};

// Event Handlers
function setupEventListeners() {
    // Navigation
    document.getElementById('main-nav').addEventListener('click', (e) => {
        if (e.target.classList.contains('nav-btn')) {
            const viewId = e.target.dataset.view;
            ui.showView(viewId);
            if (viewId === 'active-orders') {
                loadActiveOrders();
            } else if (viewId === 'finished-orders') {
                loadFinishedOrders();
            }
        }
    });

    // Products
    document.getElementById('products-grid').addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            const productId = productCard.dataset.id;
            addToOrder(productId);
        }
    });

    // Order Controls
    document.getElementById('pay-btn').addEventListener('click', showPaymentModal);
    document.getElementById('clear-btn').addEventListener('click', clearOrder);
    document.getElementById('confirm-payment').addEventListener('click', processPayment);
    document.getElementById('cancel-payment').addEventListener('click', hidePaymentModal);

    // Remove items from order
    document.getElementById('order-items').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            removeFromOrder(e.target.dataset.id);
        }
    });
}

// Order Management
function addToOrder(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = state.currentOrder.items.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        state.currentOrder.items.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    updateOrderTotal();
    ui.updateOrderItems();
    ui.updateOrderSummary();
}

function removeFromOrder(productId) {
    state.currentOrder.items = state.currentOrder.items.filter(item => item.id !== productId);
    updateOrderTotal();
    ui.updateOrderItems();
    ui.updateOrderSummary();
}

function updateOrderTotal() {
    state.currentOrder.total = state.currentOrder.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
    );
}

function clearOrder() {
    state.currentOrder.items = [];
    state.currentOrder.total = 0;
    ui.updateOrderItems();
    ui.updateOrderSummary();
}

// Payment Handling
function showPaymentModal() {
    document.getElementById('payment-modal').classList.remove('hidden');
}

function hidePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
}

async function processPayment() {
    const order = {
        items: state.currentOrder.items,
        total: state.currentOrder.total,
        tax: state.currentOrder.total * 0.1,
        status: 'active'
    };

    try {
        await api.createOrder(order);
        clearOrder();
        hidePaymentModal();
        ui.showView('active-orders');
        await loadActiveOrders();
    } catch (error) {
        console.error('Payment processing failed:', error);
    }
}

// Order Loading
async function loadActiveOrders() {
    try {
        const orders = await api.getOrders('active');
        ui.updateActiveOrders(orders);
    } catch (error) {
        console.error('Failed to load active orders:', error);
    }
}

async function loadFinishedOrders() {
    try {
        const orders = await api.getOrders('finished');
        ui.updateActiveOrders(orders);
    } catch (error) {
        console.error('Failed to load finished orders:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load initial data
        state.categories = await api.getCategories();
        state.products = await api.getProducts();
        
        // Set up UI
        ui.updateCategories(state.categories);
        ui.updateProducts(state.products);
        
        // Set up events
        setupEventListeners();
    } catch (error) {
        console.error('Initialization failed:', error);
    }
});
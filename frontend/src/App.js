import React, { useState, useEffect, useMemo, useCallback } from "react";
import burger from "./images/burger.jpg";
import pizza from "./images/pizza.jpg";
import coffee from "./images/coffee.jpg";
import Navbar from "./Navbar";
import "./App.css";

const ADMIN_USER = {
  id: 1,
  email: "admin@gmail.com",
  password: "123456",
  name: "Admin",
  role: "admin",
};

const ORDERS_KEY = "sc_orders";
const USERS_KEY = "sc_users";
const CART_KEY = "sc_cart";
const FAV_KEY = "sc_favorites";
const THEME_KEY = "sc_theme";

const ORDER_STATUSES = ["Pending", "Preparing", "Ready", "Served"];

const FOOD_BASE = [
  { id: 1, name: "Classic Grilled Burger", description: "Toasted brioche, cheddar, house sauce", price: 89, image: burger, category: "Mains" },
  { id: 2, name: "Wood-Fired Margherita", description: "San Marzano tomato, fresh mozzarella, basil", price: 129, image: pizza, category: "Mains" },
  { id: 3, name: "Cold Brew Latte", description: "Slow-steeped coffee, oat milk option", price: 65, image: coffee, category: "Beverages" },
  { id: 4, name: "Truffle Parmesan Fries", description: "Crisp fries, truffle oil, aged parmesan", price: 59, image: burger, category: "Sides" },
  { id: 5, name: "Chipotle Chicken Tacos", description: "Soft corn shells, pico, lime crema", price: 79, image: pizza, category: "Mains" },
  { id: 6, name: "Fresh Valencia Orange Juice", description: "Cold-pressed, no added sugar", price: 49, image: coffee, category: "Beverages" },
  { id: 7, name: "Southern Fried Chicken", description: "Buttermilk brine, smoky paprika rub", price: 159, image: burger, category: "Mains" },
  { id: 8, name: "Mediterranean Quinoa Bowl", description: "Feta, olives, lemon herb dressing", price: 95, image: pizza, category: "Healthy" },
  { id: 9, name: "Belgian Chocolate Mousse", description: "Dark chocolate, vanilla chantilly", price: 110, image: coffee, category: "Desserts" },
  { id: 10, name: "Hibiscus Iced Tea", description: "Brewed in-house, lightly sweetened", price: 45, image: burger, category: "Beverages" },
  { id: 11, name: "Grilled Paneer Wrap", description: "Whole wheat, mint chutney, crunchy veg", price: 85, image: pizza, category: "Mains" },
  { id: 12, name: "Salted Caramel Brownie", description: "Fudgy center, sea salt flakes", price: 69, image: coffee, category: "Desserts" },
  { id: 13, name: "Masala Chai", description: "Assam tea, cardamom, ginger", price: 40, image: coffee, category: "Beverages" },
  { id: 14, name: "BBQ Pulled Jackfruit Slider", description: "Mini buns, slaw, pickles", price: 92, image: burger, category: "Mains" },
  { id: 15, name: "Caesar Salad", description: "Romaine, parmesan crisps, classic dressing", price: 72, image: pizza, category: "Healthy" },
  { id: 16, name: "Loaded Nachos", description: "Jalapeños, beans, cheese sauce, salsa", price: 88, image: pizza, category: "Sides" },
  { id: 17, name: "Penne Alfredo", description: "Cream sauce, cracked pepper, parsley", price: 118, image: pizza, category: "Mains" },
  { id: 18, name: "Mango Lassi", description: "Alphonso mango, yogurt, cardamom", price: 55, image: coffee, category: "Beverages" },
  { id: 19, name: "Garlic Bread Sticks", description: "Herb butter, marinara dip", price: 48, image: burger, category: "Sides" },
  { id: 20, name: "Tiramisu Slice", description: "Espresso-soaked sponge, mascarpone", price: 125, image: coffee, category: "Desserts" },
  { id: 21, name: "Thai Green Curry & Rice", description: "Coconut broth, seasonal vegetables", price: 135, image: pizza, category: "Mains" },
  { id: 22, name: "Acai Energy Bowl", description: "Granola, seasonal fruit, honey drizzle", price: 142, image: coffee, category: "Healthy" },
  { id: 23, name: "Smoked Salmon Bagel", description: "Cream cheese, capers, red onion", price: 168, image: burger, category: "Mains" },
  { id: 24, name: "Espresso Tonic", description: "Double shot, artisan tonic, citrus peel", price: 95, image: coffee, category: "Beverages" },
  { id: 25, name: "Basque Cheesecake", description: "Caramelized top, vanilla bean", price: 115, image: coffee, category: "Desserts" },
];

const PREP_BY_ID = {
  1: 12, 2: 14, 3: 4, 4: 8, 5: 11, 6: 3, 7: 16, 8: 9, 9: 6, 10: 3,
  11: 8, 12: 5, 13: 5, 14: 10, 15: 7, 16: 9, 17: 13, 18: 4, 19: 7, 20: 5,
  21: 15, 22: 6, 23: 10, 24: 4, 25: 6,
};

const POPULAR_IDS = new Set([1, 2, 7, 9, 17, 20, 21, 25]);
const VEG_IDS = new Set([3, 8, 11, 13, 15, 16, 18, 21, 22, 24]);

const FOOD_ITEMS = FOOD_BASE.map((f) => ({
  ...f,
  prepMins: PREP_BY_ID[f.id] ?? 10,
  popular: POPULAR_IDS.has(f.id),
  vegetarian: VEG_IDS.has(f.id),
}));

function loadUsersFromStorage() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [ADMIN_USER];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return [ADMIN_USER];
    const hasAdmin = parsed.some(
      (u) => u.email === ADMIN_USER.email && u.role === "admin"
    );
    if (!hasAdmin) return [ADMIN_USER, ...parsed];
    return parsed;
  } catch {
    return [ADMIN_USER];
  }
}

function normalizeOrderItem(it) {
  return {
    id: it.id,
    name: it.name,
    price: it.price,
    category: it.category,
    qty: typeof it.qty === "number" && it.qty > 0 ? it.qty : 1,
  };
}

function normalizeOrder(o) {
  return {
    ...o,
    status: ORDER_STATUSES.includes(o.status) ? o.status : "Pending",
    items: Array.isArray(o.items) ? o.items.map(normalizeOrderItem) : [],
  };
}

function loadOrdersFromStorage() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeOrder);
  } catch {
    return [];
  }
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l.id === "number" && typeof l.qty === "number")
      .map((l) => ({
        lineId: l.lineId || `${l.id}-${Math.random()}`,
        id: l.id,
        name: l.name,
        price: l.price,
        category: l.category,
        qty: Math.min(99, Math.max(1, l.qty)),
      }));
  } catch {
    return [];
  }
}

function loadFavoritesFromStorage() {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === "number"));
  } catch {
    return new Set();
  }
}

function loadTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function orderItemQtySum(items) {
  return items.reduce((s, it) => s + (it.qty || 1), 0);
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} role="status">
          <span className="toast-msg">{t.message}</span>
          <button type="button" className="toast-close" aria-label="Dismiss" onClick={() => onDismiss(t.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function ConfirmOrderModal({ open, onClose, onConfirm, cartLines, total, paymentMethod }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-order-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-order-title" className="modal-title">
          Confirm your order
        </h2>
        <p className="modal-sub">Review items and payment before sending to the kitchen.</p>
        <ul className="modal-list">
          {cartLines.map((line) => (
            <li key={line.lineId}>
              <span>
                {line.qty}× {line.name}
              </span>
              <span>₹{line.price * line.qty}</span>
            </li>
          ))}
        </ul>
        <div className="modal-total-row">
          <span>Total</span>
          <strong>₹{total}</strong>
        </div>
        <p className="modal-pay">
          Payment: <strong>{paymentMethod}</strong>
        </p>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Back
          </button>
          <button type="button" className="btn-primary" onClick={onConfirm}>
            Confirm &amp; place order
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [userRole, setUserRole] = useState("customer");
  const [cart, setCart] = useState(loadCartFromStorage);
  const [orders, setOrders] = useState(loadOrdersFromStorage);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [users, setUsers] = useState(loadUsersFromStorage);
  const [activeView, setActiveView] = useState("home");
  const [menuCategory, setMenuCategory] = useState("All");
  const [menuSearch, setMenuSearch] = useState("");
  const [menuSort, setMenuSort] = useState("featured");
  const [favorites, setFavorites] = useState(loadFavoritesFromStorage);
  const [theme, setTheme] = useState(loadTheme);
  const [toasts, setToasts] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const queueCount = orders.filter((o) => o.status !== "Served").length;

  const pushToast = useCallback((message, type = "success") => {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  useEffect(() => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const cartTotalQty = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((s, l) => s + l.price * l.qty, 0), [cart]);

  const categories = useMemo(() => {
    const set = new Set(FOOD_ITEMS.map((f) => f.category));
    return ["All", ...Array.from(set)];
  }, []);

  const filteredMenu = useMemo(() => {
    let list =
      menuCategory === "All"
        ? [...FOOD_ITEMS]
        : FOOD_ITEMS.filter((f) => f.category === menuCategory);
    const q = menuSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }
    if (menuSort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (menuSort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (menuSort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    else {
      list.sort((a, b) => {
        if (a.popular !== b.popular) return a.popular ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    }
    return list;
  }, [menuCategory, menuSearch, menuSort]);

  const featuredItems = useMemo(() => FOOD_ITEMS.filter((f) => f.popular).slice(0, 4), []);

  const addToCart = useCallback(
    (item) => {
      setCart((c) => {
        const idx = c.findIndex((l) => l.id === item.id);
        if (idx >= 0) {
          const next = [...c];
          next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + 1) };
          return next;
        }
        return [
          ...c,
          {
            lineId: `${item.id}-${Date.now()}`,
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            qty: 1,
          },
        ];
      });
      pushToast(`Added “${item.name}” to cart`, "success");
    },
    [pushToast]
  );

  const setLineQty = useCallback((lineId, qty) => {
    const n = Math.max(0, Math.min(99, qty));
    setCart((c) => {
      if (n === 0) return c.filter((l) => l.lineId !== lineId);
      return c.map((l) => (l.lineId === lineId ? { ...l, qty: n } : l));
    });
  }, []);

  const removeLine = useCallback((lineId) => {
    setCart((c) => c.filter((l) => l.lineId !== lineId));
  }, []);

  const toggleFavorite = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        pushToast("Removed from favorites", "info");
      } else {
        next.add(id);
        pushToast("Saved to favorites", "success");
      }
      return next;
    });
  }, [pushToast]);

  const reorderFromHistory = useCallback((order) => {
    setCart((oldCart) => {
      const next = [...oldCart];
      order.items.forEach((it) => {
        const food = FOOD_ITEMS.find((f) => f.id === it.id);
        if (!food) return;
        const addQty = it.qty || 1;
        const idx = next.findIndex((l) => l.id === food.id);
        if (idx >= 0) {
          next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + addQty) };
        } else {
          next.push({
            lineId: `${food.id}-${Date.now()}-${Math.random()}`,
            id: food.id,
            name: food.name,
            price: food.price,
            category: food.category,
            qty: addQty,
          });
        }
      });
      return next;
    });
    pushToast("Items from this order were added to your cart", "success");
    setActiveView("order");
  }, [pushToast]);

  const finalizeOrder = useCallback(() => {
    if (cart.length === 0) return;
    const newOrder = {
      id: Date.now(),
      items: cart.map(({ id, name, price, category, qty }) => ({
        id,
        name,
        price,
        category,
        qty,
      })),
      total: totalPrice,
      payment: paymentMethod,
      placedAt: new Date().toISOString(),
      status: "Pending",
    };
    setOrders((o) => [...o, newOrder]);
    setCart([]);
    setConfirmOpen(false);
    setActiveView("order");
    pushToast("Order received. We will notify you when it is ready.", "success");
  }, [cart, totalPrice, paymentMethod, pushToast]);

  const handlePlaceOrderClick = () => {
    if (cart.length === 0) return;
    setConfirmOpen(true);
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    pushToast(`Order #${orderId} marked as ${status}`, "info");
  };

  const clearAllOrders = () => {
    if (!window.confirm("Delete all orders from this device? This cannot be undone.")) return;
    setOrders([]);
    setExpandedOrderId(null);
    pushToast("All orders cleared", "info");
  };

  const handleSignup = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      pushToast("Please fill in all fields.", "error");
      return;
    }
    if (password !== confirmPassword) {
      pushToast("Passwords do not match.", "error");
      return;
    }
    if (password.length < 6) {
      pushToast("Password must be at least 6 characters.", "error");
      return;
    }
    const normalized = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalized)) {
      pushToast("This email is already registered. Please sign in.", "error");
      return;
    }
    const newUser = {
      id: Date.now(),
      email: email.trim(),
      password,
      name: name.trim(),
      role: "customer",
    };
    setUsers((u) => [...u, newUser]);
    setIsLoggedIn(true);
    setUserRole("customer");
    setActiveView("home");
    pushToast(`Welcome, ${newUser.name}. Your account is ready.`, "success");
  };

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      pushToast("Please enter email and password.", "error");
      return;
    }
    const user = users.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );
    if (user) {
      setIsLoggedIn(true);
      setUserRole(user.role);
      setName(user.name);
      setActiveView(user.role === "admin" ? "admin" : "home");
      pushToast(user.role === "admin" ? "Signed in as administrator." : `Welcome back, ${user.name}.`, "success");
    } else {
      pushToast("Invalid email or password.", "error");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    setName("");
    setConfirmPassword("");
    setIsSignupMode(false);
    setCart([]);
    setUserRole("customer");
    setActiveView("home");
    setConfirmOpen(false);
    pushToast("You have been signed out.", "info");
  };

  const switchAuthMode = (signup) => {
    setIsSignupMode(signup);
    setPassword("");
    setConfirmPassword("");
  };

  const toggleTheme = () => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  };

  const themeToggleBtn = (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );

  const statusClass = (status) => {
    const s = (status || "").toLowerCase();
    return `status-pill status-${s.replace(/\s+/g, "-")}`;
  };

  if (!isLoggedIn) {
    return (
      <div className={`login-page ${theme === "dark" ? "login-page-dark" : ""}`}>
        <div className="login-panel">
          <div className="login-brand">
            <span className="login-logo" aria-hidden="true">
              SC
            </span>
            <div>
              <h1 className="login-title">Smart Canteen</h1>
              <p className="login-tagline">Campus dining with live queue insight, saved favorites, and one-tap checkout.</p>
            </div>
          </div>

          <div className="login-toolbar">
            <div className="auth-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={!isSignupMode}
                className={`auth-tab ${!isSignupMode ? "auth-tab-active" : ""}`}
                onClick={() => switchAuthMode(false)}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={isSignupMode}
                className={`auth-tab ${isSignupMode ? "auth-tab-active" : ""}`}
                onClick={() => switchAuthMode(true)}
              >
                Create account
              </button>
            </div>
            {themeToggleBtn}
          </div>

          <div className="auth-form">
            {isSignupMode ? (
              <>
                <div className="form-group">
                  <label htmlFor="reg-name">Full name</label>
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email">Email</label>
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-password">Password</label>
                  <input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-confirm">Confirm password</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button type="button" className="auth-btn" onClick={handleSignup}>
                  Create account
                </button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="login-email">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLogin();
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLogin();
                    }}
                  />
                </div>
                <button type="button" className="auth-btn" onClick={handleLogin}>
                  Sign in
                </button>
              </>
            )}

            <div className="demo-info">
              <p className="demo-info-title">Default admin login</p>
              <p>
                Email <strong>admin@gmail.com</strong>
              </p>
              <p>
                Password <strong>123456</strong>
              </p>
            </div>
          </div>
        </div>
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  if (userRole === "admin") {
    const revenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingCount = orders.filter((o) => o.status === "Pending" || o.status === "Preparing").length;

    return (
      <div className={`app-container theme-scope ${theme === "dark" ? "theme-dark" : ""}`}>
        <Navbar userRole="admin" activeView={activeView} onNavigate={setActiveView} headerExtras={themeToggleBtn} />
        <div className="header header-admin">
          <div>
            <h1>Admin dashboard</h1>
            <p className="header-sub">Monitor revenue, update order status, and review the live menu catalog.</p>
          </div>
          <div className="header-info">
            <span className="header-pill">{name}</span>
            <button type="button" className="logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="admin-stats">
            <div className="admin-stat-card">
              <h3>{orders.length}</h3>
              <p>Total orders</p>
            </div>
            <div className="admin-stat-card">
              <h3>{pendingCount}</h3>
              <p>Active kitchen queue</p>
            </div>
            <div className="admin-stat-card">
              <h3>₹{revenue}</h3>
              <p>Recorded revenue</p>
            </div>
            <div className="admin-stat-card">
              <h3>{FOOD_ITEMS.length}</h3>
              <p>Menu items live</p>
            </div>
          </div>

          <div className="admin-section">
            <div className="section-head">
              <h2>Order pipeline</h2>
              {orders.length > 0 && (
                <button type="button" className="btn-danger-outline" onClick={clearAllOrders}>
                  Clear all orders
                </button>
              )}
            </div>
            <div className="orders-table">
              {orders.length === 0 ? (
                <p className="empty-table-msg">No orders yet. Customer checkouts from this browser will appear here.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th aria-label="expand" />
                      <th>Order</th>
                      <th>When</th>
                      <th>Pieces</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, index) => {
                      const open = expandedOrderId === order.id;
                      const pieces = orderItemQtySum(order.items);
                      return (
                        <React.Fragment key={order.id || index}>
                          <tr className={open ? "row-open" : ""}>
                            <td>
                              <button
                                type="button"
                                className="btn-icon-small"
                                aria-expanded={open}
                                aria-label={open ? "Collapse details" : "Expand details"}
                                onClick={() =>
                                  setExpandedOrderId((id) => (id === order.id ? null : order.id))
                                }
                              >
                                {open ? "−" : "+"}
                              </button>
                            </td>
                            <td>#{index + 1}</td>
                            <td>{order.placedAt ? new Date(order.placedAt).toLocaleString() : "—"}</td>
                            <td>{pieces}</td>
                            <td>₹{order.total}</td>
                            <td>{order.payment}</td>
                            <td>
                              <select
                                className="status-select"
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                aria-label={`Status for order ${index + 1}`}
                              >
                                {ORDER_STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                          {open && (
                            <tr className="detail-row">
                              <td colSpan={7}>
                                <div className="order-detail-box">
                                  <strong>Line items</strong>
                                  <ul>
                                    {order.items.map((it, i) => (
                                      <li key={`${it.id}-${i}`}>
                                        {it.qty}× {it.name} — ₹{it.price * (it.qty || 1)}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="admin-section">
            <h2>Menu catalog</h2>
            <div className="menu-admin-grid">
              {FOOD_ITEMS.map((item) => (
                <div key={item.id} className="menu-admin-card">
                  <div className="menu-admin-img-wrap">
                    <img src={item.image} alt="" />
                    {item.popular && <span className="ribbon">Popular</span>}
                  </div>
                  <h3>{item.name}</h3>
                  <p className="menu-card-desc admin-card-desc">{item.description}</p>
                  <div className="admin-card-meta">
                    <span className="category-badge">{item.category}</span>
                    {item.vegetarian && <span className="tag-veg">Veg</span>}
                    <span className="tag-prep">{item.prepMins} min</span>
                  </div>
                  <p className="price">₹{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ToastStack toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  const showFab = cartTotalQty > 0 && activeView !== "order";

  return (
    <div className={`app-container theme-scope ${theme === "dark" ? "theme-dark" : ""}`}>
      <Navbar
        userRole="customer"
        activeView={activeView}
        onNavigate={setActiveView}
        cartQty={cartTotalQty}
        headerExtras={themeToggleBtn}
      />
      <div className="header">
        <div>
          <h1>Smart Canteen</h1>
          <p className="header-sub">
            Hi {name} — browse the menu, save favorites, and track your queue in real time.
          </p>
        </div>
        <div className="header-info">
          <span className="header-pill">Active queue: {queueCount}</span>
          <span className="header-pill">Est. wait ~{Math.min(queueCount * 4, 60)} min</span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="main-content">
        {activeView === "home" && (
          <div className="home-view">
            <div className="hero-grid">
              <div className="hero-card hero-card-main">
                <p className="hero-kicker">Smart Canteen</p>
                <h2>Fresh food, campus-fast</h2>
                <p>
                  Search the menu, filter by category, and build a cart with precise quantities. Checkout lives on the
                  Order tab with payment presets and full history.
                </p>
                <div className="hero-actions">
                  <button type="button" className="hero-cta" onClick={() => setActiveView("menu")}>
                    Explore menu
                  </button>
                  <button type="button" className="hero-cta ghost" onClick={() => setActiveView("order")}>
                    Go to checkout
                  </button>
                </div>
              </div>
              <div className="hero-side">
                <h3>Chef picks</h3>
                <ul className="mini-menu">
                  {featuredItems.map((f) => (
                    <li key={f.id}>
                      <button type="button" className="mini-menu-row" onClick={() => addToCart(f)}>
                        <span>{f.name}</span>
                        <span className="mini-price">₹{f.price}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="stats-bar">
              <div className="stat-card">
                <h3>{cartTotalQty}</h3>
                <p>Items in cart</p>
              </div>
              <div className="stat-card">
                <h3>₹{totalPrice}</h3>
                <p>Cart total</p>
              </div>
              <div className="stat-card">
                <h3>{orders.length}</h3>
                <p>Orders placed</p>
              </div>
              <div className="stat-card">
                <h3>{favorites.size}</h3>
                <p>Favorites saved</p>
              </div>
            </div>
          </div>
        )}

        {activeView === "menu" && (
          <>
            <div className="menu-toolbar">
              <div className="menu-toolbar-top">
                <h2 className="section-title">Menu</h2>
                <div className="menu-controls">
                  <input
                    type="search"
                    className="menu-search"
                    placeholder="Search dishes, ingredients…"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    aria-label="Search menu"
                  />
                  <select
                    className="menu-sort"
                    value={menuSort}
                    onChange={(e) => setMenuSort(e.target.value)}
                    aria-label="Sort menu"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-asc">Price: low to high</option>
                    <option value="price-desc">Price: high to low</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </div>
              </div>
              <div className="category-chips">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-chip ${menuCategory === cat ? "category-chip-active" : ""}`}
                    onClick={() => setMenuCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {filteredMenu.length === 0 ? (
              <p className="empty-menu">No dishes match your filters. Try another search or category.</p>
            ) : (
              <div className="menu-grid">
                {filteredMenu.map((item) => (
                  <article key={item.id} className="menu-card">
                    <div className="menu-card-img-wrap">
                      <img src={item.image} alt="" />
                      {item.popular && <span className="ribbon">Popular</span>}
                      <button
                        type="button"
                        className={`fav-btn ${favorites.has(item.id) ? "fav-on" : ""}`}
                        aria-label={favorites.has(item.id) ? "Remove from favorites" : "Add to favorites"}
                        onClick={() => toggleFavorite(item.id)}
                      >
                        ♥
                      </button>
                    </div>
                    <div className="menu-card-content">
                      <h3>{item.name}</h3>
                      <p className="menu-card-desc">{item.description}</p>
                      <div className="menu-card-meta">
                        <span className="category-badge">{item.category}</span>
                        {item.vegetarian ? <span className="tag-veg">Veg</span> : null}
                        <span className="tag-prep">{item.prepMins} min</span>
                      </div>
                      <p className="price">₹{item.price}</p>
                      <button type="button" onClick={() => addToCart(item)}>
                        Add to cart
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {activeView === "order" && (
          <>
            <div className="stats-bar">
              <div className="stat-card">
                <h3>{cartTotalQty}</h3>
                <p>Items in cart</p>
              </div>
              <div className="stat-card">
                <h3>₹{totalPrice}</h3>
                <p>Cart total</p>
              </div>
              <div className="stat-card">
                <h3>{orders.length}</h3>
                <p>Orders placed</p>
              </div>
            </div>

            <div className="cart-container">
              <h2>Your cart</h2>

              <div className="cart-summary">
                <div className="summary-item">
                  <label>Line items</label>
                  <p>{cart.length}</p>
                </div>
                <div className="summary-item">
                  <label>Total pieces</label>
                  <p>{cartTotalQty}</p>
                </div>
                <div className="summary-item">
                  <label>Subtotal</label>
                  <p>₹{totalPrice}</p>
                </div>
                <div className="summary-item">
                  <label>Payment</label>
                  <p>{paymentMethod}</p>
                </div>
              </div>

              <div className="payment-section">
                <label htmlFor="pay-method">Payment method</label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option>UPI</option>
                  <option>Cash</option>
                  <option>Card</option>
                  <option>Debit Card</option>
                  <option>Credit Card</option>
                  <option>Meal plan / ID card</option>
                </select>
              </div>

              {cart.length > 0 && (
                <div>
                  <h3 className="cart-items-heading">Line items</h3>
                  <div className="cart-items">
                    {cart.map((line) => (
                      <div key={line.lineId} className="cart-item cart-item-rich">
                        <div className="cart-item-info">
                          <p className="cart-item-title">{line.name}</p>
                          <p className="cart-item-sub">₹{line.price} each · {line.category}</p>
                        </div>
                        <div className="qty-control">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => setLineQty(line.lineId, line.qty - 1)}
                          >
                            −
                          </button>
                          <span>{line.qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => setLineQty(line.lineId, line.qty + 1)}
                          >
                            +
                          </button>
                        </div>
                        <p className="cart-line-total">₹{line.price * line.qty}</p>
                        <button type="button" className="btn-remove-line" onClick={() => removeLine(line.lineId)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="place-order-btn"
                onClick={handlePlaceOrderClick}
                disabled={cart.length === 0}
              >
                {cart.length === 0 ? "Add items from the menu" : "Review & place order"}
              </button>
            </div>

            <div className="order-history">
              <h2>Order history</h2>
              {orders.length === 0 ? (
                <div className="no-orders">
                  <p>No orders yet. Build a cart from the menu, then confirm checkout here.</p>
                </div>
              ) : (
                orders.map((order, index) => (
                  <div key={order.id || index} className="order-card">
                    <div className="order-card-head">
                      <h3>Order #{index + 1}</h3>
                      <span className={statusClass(order.status)}>{order.status}</span>
                    </div>
                    <div>
                      {order.items.map((it, i) => (
                        <p key={`${it.id}-${i}`}>
                          • {it.qty > 1 ? `${it.qty}× ` : ""}
                          {it.name} — ₹{it.price * (it.qty || 1)}
                        </p>
                      ))}
                    </div>
                    <h4>
                      Total: ₹{order.total} · {order.payment}
                    </h4>
                    <button type="button" className="btn-secondary small" onClick={() => reorderFromHistory(order)}>
                      Order again
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showFab && (
        <button type="button" className="cart-fab" onClick={() => setActiveView("order")}>
          <span className="cart-fab-label">Cart</span>
          <span className="cart-fab-qty">{cartTotalQty}</span>
          <span className="cart-fab-total">₹{totalPrice}</span>
        </button>
      )}

      <ConfirmOrderModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={finalizeOrder}
        cartLines={cart}
        total={totalPrice}
        paymentMethod={paymentMethod}
      />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;

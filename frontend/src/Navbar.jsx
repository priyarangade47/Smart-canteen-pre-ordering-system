export default function Navbar({
  userRole,
  activeView,
  onNavigate,
  cartQty = 0,
  headerExtras = null,
}) {
  if (userRole === "admin") {
    return (
      <div className="navbar">
        <nav className="navbar-inner">
          <button
            type="button"
            className={`nav-tab ${activeView === "admin" ? "nav-tab-active" : ""}`}
            onClick={() => onNavigate("admin")}
          >
            Dashboard
          </button>
          <div className="navbar-actions">{headerExtras}</div>
        </nav>
      </div>
    );
  }

  return (
    <div className="navbar">
      <nav className="navbar-inner">
        <button
          type="button"
          className={`nav-tab ${activeView === "home" ? "nav-tab-active" : ""}`}
          onClick={() => onNavigate("home")}
        >
          Home
        </button>
        <button
          type="button"
          className={`nav-tab ${activeView === "menu" ? "nav-tab-active" : ""}`}
          onClick={() => onNavigate("menu")}
        >
          Menu
        </button>
        <button
          type="button"
          className={`nav-tab nav-tab-order ${activeView === "order" ? "nav-tab-active" : ""}`}
          onClick={() => onNavigate("order")}
        >
          Order
          {cartQty > 0 && (
            <span className="nav-cart-badge" aria-label={`${cartQty} items in cart`}>
              {cartQty > 99 ? "99+" : cartQty}
            </span>
          )}
        </button>
        <div className="navbar-actions">{headerExtras}</div>
      </nav>
    </div>
  );
}

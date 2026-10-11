const { useState, useEffect, useMemo } = React;

// ============================================================================
//  CONFIG  — change this PIN to whatever you want
// ============================================================================
const PANTRY_PIN = "2580";

const CATEGORIES = {
  hot:   { label: "Hot Drinks",  iconKey: "Flame",     accent: "#c2410c" },
  cold:  { label: "Cold Drinks", iconKey: "Snowflake", accent: "#0369a1" },
  snack: { label: "Snacks",      iconKey: "Cookie",    accent: "#a16207" },
};

const STATUSES = [
  { key: "pending",   label: "Pending",   iconKey: "Clock",        bg: "#fef3c7", fg: "#92400e", dot: "#d97706" },
  { key: "preparing", label: "Preparing", iconKey: "ChefHat",      bg: "#dbeafe", fg: "#1e40af", dot: "#2563eb" },
  { key: "ready",     label: "Ready",     iconKey: "Package",      bg: "#ede9fe", fg: "#5b21b6", dot: "#7c3aed" },
  { key: "delivered", label: "Delivered", iconKey: "CheckCircle2", bg: "#dcfce7", fg: "#166534", dot: "#16a34a" },
];

const T = {
  bg: "#faf5ec", card: "#ffffff", ink: "#1c1410", ink2: "#4a3f36",
  muted: "#8b7e6f", border: "#ebdfca", borderS: "#f1e8d6",
  accent: "#b63528", accentD: "#8e2820", cream: "#fff9ee",
  brand: "#b63528",
};
const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_BODY    = "'DM Sans', -apple-system, system-ui, sans-serif";

// ============================================================================
//  ICONS (inline SVG — no external lib needed)
// ============================================================================
const Icon = ({ size = 16, children, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {children}
  </svg>
);
const ShoppingCart = (p) => <Icon {...p}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></Icon>;
const Coffee       = (p) => <Icon {...p}><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></Icon>;
const Plus         = (p) => <Icon {...p}><path d="M5 12h14"/><path d="M12 5v14"/></Icon>;
const Minus        = (p) => <Icon {...p}><path d="M5 12h14"/></Icon>;
const Check        = (p) => <Icon {...p}><path d="M20 6 9 17l-5-5"/></Icon>;
const Clock        = (p) => <Icon {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Icon>;
const ChefHat      = (p) => <Icon {...p}><path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z"/><path d="M6 17h12"/></Icon>;
const Package      = (p) => <Icon {...p}><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></Icon>;
const Trash2       = (p) => <Icon {...p}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></Icon>;
const ArrowLeft    = (p) => <Icon {...p}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></Icon>;
const RefreshCw    = (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></Icon>;
const Snowflake    = (p) => <Icon {...p}><path d="M2 12h20"/><path d="M12 2v20"/><path d="m20 16-4-4 4-4"/><path d="m4 8 4 4-4 4"/><path d="m16 4-4 4-4-4"/><path d="m8 20 4-4 4 4"/></Icon>;
const Cookie       = (p) => <Icon {...p}><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></Icon>;
const Flame        = (p) => <Icon {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></Icon>;
const Lock         = (p) => <Icon {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Icon>;
const CheckCircle2 = (p) => <Icon {...p}><path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/></Icon>;
const Bell         = (p) => <Icon {...p}><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></Icon>;
const ChevronRight = (p) => <Icon {...p}><path d="m9 18 6-6-6-6"/></Icon>;
const AlertTriangle= (p) => <Icon {...p}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></Icon>;
const Eye          = (p) => <Icon {...p}><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></Icon>;
const EyeOff       = (p) => <Icon {...p}><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></Icon>;
const Building2    = (p) => <Icon {...p}><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></Icon>;
const UserRound    = (p) => <Icon {...p}><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></Icon>;

const ICONS = { Flame, Snowflake, Cookie, Clock, ChefHat, Package, CheckCircle2 };

// ============================================================================
//  API CLIENT (talks to local server)
// ============================================================================
const api = {
  async getState() {
    const r = await fetch("/api/state");
    if (!r.ok) throw new Error("fetch state");
    return r.json();
  },
  async placeOrder(order) {
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!r.ok) throw new Error("place order");
    return r.json();
  },
  async setStatus(id, status) {
    const r = await fetch("/api/orders/" + encodeURIComponent(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) throw new Error("set status");
    return r.json();
  },
  async deleteOrder(id) {
    await fetch("/api/orders/" + encodeURIComponent(id), { method: "DELETE" });
  },
  async setMenu(menu) {
    const r = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ menu }),
    });
    if (!r.ok) throw new Error("set menu");
    return r.json();
  },
};

// ============================================================================
//  ROOT
// ============================================================================
function App() {
  const [view, setView]   = useState("home");
  const [menu, setMenu]   = useState(null);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.getState();
        setMenu(s.menu); setOrders(s.orders || []);
      } catch (e) { console.error(e); }
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t = setInterval(async () => {
      try {
        const s = await api.getState();
        setMenu(s.menu); setOrders(s.orders || []);
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [ready]);

  const refresh = async () => {
    try { const s = await api.getState(); setMenu(s.menu); setOrders(s.orders || []); }
    catch {}
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.bg,
      backgroundImage: "radial-gradient(circle at 12% 8%, rgba(194,65,12,0.07) 0, transparent 35%), radial-gradient(circle at 88% 92%, rgba(154,52,18,0.05) 0, transparent 40%)",
      fontFamily: FONT_BODY, color: T.ink,
    }}>
      {!ready ? <LoadingScreen />
        : view === "home" ? <HomeView onPick={setView} />
        : view === "employee" ? (
          <EmployeeView
            menu={menu} orders={orders}
            onBack={() => setView("home")}
            onPlaceOrder={async (order) => {
              const placed = await api.placeOrder(order);
              setOrders(o => [placed, ...o]);
              return placed;
            }}
            onRefresh={refresh}
          />
        ) : (
          <PantryView
            menu={menu} orders={orders}
            onBack={() => setView("home")}
            onUpdateMenu={async (m) => { await api.setMenu(m); setMenu(m); }}
            onSetStatus={async (id, status) => {
              const updated = await api.setStatus(id, status);
              setOrders(o => o.map(x => x.id === id ? updated : x));
            }}
            onDeleteOrder={async (id) => {
              await api.deleteOrder(id);
              setOrders(o => o.filter(x => x.id !== id));
            }}
            onRefresh={refresh}
          />
        )}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          border: "3px solid " + T.borderS, borderTopColor: T.accent,
          animation: "spin 1s linear infinite", margin: "0 auto 16px",
        }} />
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, color: T.ink2 }}>Warming up the pantry…</div>
      </div>
    </div>
  );
}

// ============================================================================
//  HOME
// ============================================================================
function HomeView({ onPick }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "28px 24px 8px", display: "flex", justifyContent: "center" }}>
        <Wordmark />
      </header>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "16px 24px 48px" }}>
        <div style={{ width: "100%", maxWidth: 980 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "6px 14px", borderRadius: 999,
            background: T.cream, border: "1px solid " + T.border,
            color: T.ink2, fontSize: 12, fontWeight: 600, letterSpacing: 1.4,
            margin: "0 auto 24px", textTransform: "uppercase",
            position: "relative", left: "50%", transform: "translateX(-50%)",
          }}>
            <Coffee size={13} /> The Pantry
          </div>
          <h1 style={{
            fontFamily: FONT_DISPLAY, fontSize: "clamp(40px, 7vw, 76px)",
            fontWeight: 600, lineHeight: 1.05, letterSpacing: "-0.02em",
            textAlign: "center", margin: "0 0 18px", color: T.ink,
          }}>
            Because comfort happens<br />
            <span style={{ fontStyle: "italic", color: T.brand }}>inside the office too.</span>
          </h1>
          <p style={{
            textAlign: "center", color: T.muted, fontSize: 17,
            maxWidth: 560, margin: "0 auto 12px", lineHeight: 1.55,
          }}>
            Order chai, coffee, and snacks from the pantry — delivered to your cabin.
          </p>
          <p style={{
            textAlign: "center", color: T.brand, fontSize: 13, fontWeight: 600,
            letterSpacing: 1.2, margin: "0 auto 44px", textTransform: "uppercase",
          }}>
            Brewed with diligence · Delivered with care
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20, maxWidth: 760, margin: "0 auto",
          }}>
            <RoleCard title="I'm ordering" subtitle="Browse the menu and place an order"
              IconC={UserRound} accent={T.brand} onClick={() => onPick("employee")} />
            <RoleCard title="Pantry staff" subtitle="View orders & manage the menu"
              IconC={Building2} accent={T.ink} onClick={() => onPick("pantry")} locked />
          </div>
        </div>
      </div>
      <footer style={{
        padding: "20px 24px", textAlign: "center",
        color: T.muted, fontSize: 12, borderTop: "1px solid " + T.borderS,
        background: "rgba(255,255,255,0.5)",
      }}>
        An internal portal for the <span style={{ color: T.brand, fontWeight: 600 }}>Raghav Group</span> family · Running on the office WiFi
      </footer>
    </div>
  );
}

function Wordmark({ size = "lg" }) {
  const isLg = size === "lg";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: isLg ? 12 : 9,
    }}>
      <div style={{
        width: isLg ? 44 : 32, height: isLg ? 44 : 32, borderRadius: isLg ? 12 : 9,
        background: T.brand, color: "#fff",
        display: "grid", placeItems: "center",
        fontFamily: FONT_DISPLAY, fontSize: isLg ? 22 : 16, fontWeight: 700,
        letterSpacing: "-0.02em", boxShadow: "0 6px 18px -8px " + T.brand,
      }}>R</div>
      <div style={{ lineHeight: 1.05 }}>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: isLg ? 20 : 15, fontWeight: 700,
          color: T.ink, letterSpacing: "-0.01em",
        }}>RAGHAV GROUP</div>
        <div style={{
          fontSize: isLg ? 10.5 : 9, fontWeight: 600, color: T.muted,
          letterSpacing: 2.2, textTransform: "uppercase", marginTop: 2,
        }}>{isLg ? "Pantry · Internal" : "Pantry"}</div>
      </div>
    </div>
  );
}

function RoleCard({ title, subtitle, IconC, accent, onClick, locked }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      textAlign: "left", cursor: "pointer", background: T.card,
      border: "1px solid " + (hover ? accent : T.border),
      borderRadius: 20, padding: 28,
      boxShadow: hover ? "0 18px 40px -20px rgba(28,20,16,0.25)" : "0 1px 2px rgba(28,20,16,0.04)",
      transition: "all 220ms ease", transform: hover ? "translateY(-3px)" : "none",
      fontFamily: FONT_BODY,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: accent + "15", color: accent,
        display: "grid", placeItems: "center", marginBottom: 18,
      }}>
        <IconC size={22} />
      </div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600,
        color: T.ink, marginBottom: 6, letterSpacing: "-0.01em",
      }}>{title}</div>
      <div style={{ color: T.muted, fontSize: 14.5, marginBottom: 18 }}>{subtitle}</div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        color: accent, fontWeight: 600, fontSize: 14,
      }}>
        {locked && <Lock size={13} />} Continue <ChevronRight size={16} />
      </div>
    </button>
  );
}

// ============================================================================
//  EMPLOYEE
// ============================================================================
function EmployeeView({ menu, orders, onBack, onPlaceOrder, onRefresh }) {
  const [name, setName] = useState("");
  const [confirmedName, setConfirmedName] = useState("");
  const [cart, setCart] = useState({});
  const [tab, setTab] = useState("menu");
  const [toast, setToast] = useState(null);

  const myOrders = useMemo(
    () => orders.filter(o => o.employeeName.toLowerCase() === confirmedName.toLowerCase()),
    [orders, confirmedName]
  );

  const cartItems = useMemo(() => {
    return Object.entries(cart).filter(([, q]) => q > 0).map(([id, q]) => {
      const item = menu.find(m => m.id === id);
      return item ? { ...item, qty: q } : null;
    }).filter(Boolean);
  }, [cart, menu]);

  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);
  const addToCart = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeOne = (id) => setCart(c => {
    const nq = (c[id] || 0) - 1;
    const nx = { ...c };
    if (nq <= 0) delete nx[id]; else nx[id] = nq;
    return nx;
  });

  const placeOrder = async () => {
    if (!cartItems.length) return;
    const order = {
      employeeName: confirmedName,
      items: cartItems.map(({ id, name, qty }) => ({ id, name, qty })),
    };
    try {
      await onPlaceOrder(order);
      setCart({});
      setToast({ kind: "success", text: `Order placed! Track it under "My Orders".` });
      setTab("orders");
      setTimeout(() => setToast(null), 3500);
    } catch {
      setToast({ kind: "error", text: "Could not place order. Check connection." });
      setTimeout(() => setToast(null), 3500);
    }
  };

  if (!confirmedName) {
    return <NameGate name={name} setName={setName}
      onSubmit={() => name.trim() && setConfirmedName(name.trim())}
      onBack={onBack} />;
  }

  const grouped = {
    hot:   menu.filter(m => m.category === "hot"),
    cold:  menu.filter(m => m.category === "cold"),
    snack: menu.filter(m => m.category === "snack"),
  };

  return (
    <div>
      <TopBar onBack={onBack} title={`Hi, ${confirmedName.split(" ")[0]}`}
        subtitle="Pantry menu"
        right={<button onClick={onRefresh} style={iconBtn} title="Refresh"><RefreshCw size={16} /></button>} />
      <Tabs value={tab} onChange={setTab} items={[
        { key: "menu",   label: "Menu" },
        { key: "orders", label: `My Orders${myOrders.length ? ` (${myOrders.length})` : ""}` },
      ]} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 120px" }}>
        {tab === "menu" ? (
          <>
            {Object.entries(grouped).map(([catKey, items]) => (
              <CategorySection key={catKey} category={catKey} items={items}
                cart={cart} onAdd={addToCart} onRemove={removeOne} />
            ))}
            <p style={{ textAlign: "center", color: T.muted, fontSize: 13, marginTop: 32 }}>
              Items in stock can be ordered. Out-of-stock items show greyed out.
            </p>
          </>
        ) : <MyOrdersList orders={myOrders} />}
      </div>
      {tab === "menu" && cartCount > 0 && (
        <CartBar items={cartItems} onPlace={placeOrder} onAdd={addToCart} onRemove={removeOne} />
      )}
      {toast && <Toast {...toast} />}
    </div>
  );
}

function NameGate({ name, setName, onSubmit, onBack }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <TopBar onBack={onBack} title="Welcome" subtitle="Let us know who's ordering" />
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 440, background: T.card,
          border: "1px solid " + T.border, borderRadius: 20, padding: 32 }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 600,
            margin: "0 0 8px", letterSpacing: "-0.01em" }}>What should we call you?</h2>
          <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
            And which cabin / desk should the order go to.
          </p>
          <input autoFocus placeholder="e.g. Priya — Cabin 3B" value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()} style={inputStyle} />
          <button onClick={onSubmit} disabled={!name.trim()}
            style={{ ...primaryBtn, width: "100%", marginTop: 16, opacity: name.trim() ? 1 : 0.5 }}>
            Continue to menu <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, items, cart, onAdd, onRemove }) {
  const meta = CATEGORIES[category];
  const IconC = ICONS[meta.iconKey];
  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <IconC size={18} color={meta.accent} />
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600,
          margin: 0, letterSpacing: "-0.01em" }}>{meta.label}</h2>
        <div style={{ flex: 1, height: 1, background: T.borderS, marginLeft: 6 }} />
      </div>
      <div style={{ display: "grid", gap: 12,
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {items.map(it => (
          <MenuItemCard key={it.id} item={it} qty={cart[it.id] || 0}
            onAdd={onAdd} onRemove={onRemove} accent={meta.accent} />
        ))}
      </div>
    </section>
  );
}

function MenuItemCard({ item, qty, onAdd, onRemove, accent }) {
  const oos = !item.inStock;
  return (
    <div style={{
      background: oos ? "#f6efe2" : T.card,
      border: "1px solid " + (qty > 0 ? accent : T.border),
      borderRadius: 16, padding: 16, opacity: oos ? 0.65 : 1,
      transition: "border-color 200ms",
    }}>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 600,
        color: T.ink, marginBottom: 4, letterSpacing: "-0.005em" }}>{item.name}</div>
      <div style={{ fontSize: 12, color: oos ? "#9a3412" : T.muted,
        fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>
        {oos ? "Out of stock" : "Available"}
      </div>
      {oos ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.muted }}>
          <AlertTriangle size={14} /> Try later
        </div>
      ) : qty === 0 ? (
        <button onClick={() => onAdd(item.id)} style={{
          ...primaryBtn, width: "100%", padding: "10px 14px",
          background: T.ink, fontSize: 14, justifyContent: "center" }}>
          <Plus size={14} /> Add
        </button>
      ) : (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: T.cream, borderRadius: 10, padding: 4,
          border: "1px solid " + T.border,
        }}>
          <button onClick={() => onRemove(item.id)} style={qtyBtn}><Minus size={14} /></button>
          <span style={{ fontWeight: 700, fontSize: 15, color: T.ink }}>{qty}</span>
          <button onClick={() => onAdd(item.id)} style={qtyBtn}><Plus size={14} /></button>
        </div>
      )}
    </div>
  );
}

function CartBar({ items, onPlace, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const count = items.reduce((s, i) => s + i.qty, 0);
  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{
        position: "fixed", inset: 0, background: "rgba(28,20,16,0.4)",
        zIndex: 30, animation: "fade 180ms ease",
      }} />}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0,
        zIndex: 40, padding: 16, pointerEvents: "none",
      }}>
        <div style={{
          maxWidth: 720, margin: "0 auto", background: T.ink, color: "#fff",
          borderRadius: 18, boxShadow: "0 20px 60px -10px rgba(28,20,16,0.4)",
          pointerEvents: "auto", overflow: "hidden",
        }}>
          {open && (
            <div style={{ padding: "16px 18px 0", maxHeight: 320, overflowY: "auto" }}>
              {items.map(i => (
                <div key={i.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500 }}>{i.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", textTransform: "capitalize" }}>
                      {i.category === "snack" ? "Snack" : i.category + " drink"}
                    </div>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: 4,
                  }}>
                    <button onClick={() => onRemove(i.id)} style={qtyBtnDark}><Minus size={13} /></button>
                    <span style={{ fontWeight: 600, fontSize: 14, minWidth: 18, textAlign: "center" }}>{i.qty}</span>
                    <button onClick={() => onAdd(i.id)} style={qtyBtnDark}><Plus size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px" }}>
            <button onClick={() => setOpen(o => !o)} style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "transparent", border: "none", color: "#fff",
              cursor: "pointer", flex: 1, textAlign: "left", padding: 0, fontFamily: FONT_BODY,
            }}>
              <div style={{ position: "relative" }}>
                <ShoppingCart size={20} />
                <span style={{
                  position: "absolute", top: -6, right: -8,
                  background: T.accent, color: "#fff", fontSize: 10, fontWeight: 700,
                  borderRadius: 999, padding: "1px 5px",
                }}>{count}</span>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{count} item{count !== 1 ? "s" : ""} in cart</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                  {open ? "Tap to collapse" : "Tap to review"}
                </div>
              </div>
            </button>
            <button onClick={onPlace} style={{
              background: T.accent, color: "#fff", border: "none",
              borderRadius: 12, padding: "10px 18px",
              fontWeight: 600, fontSize: 14, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT_BODY,
            }}>
              Place order <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function MyOrdersList({ orders }) {
  if (!orders.length) {
    return <EmptyState IconC={Bell} title="No orders yet"
      text="When you place an order, you can track its status here." />;
  }
  return (
    <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
      {orders.map(o => <OrderCard key={o.id} order={o} compact />)}
    </div>
  );
}

// ============================================================================
//  PANTRY
// ============================================================================
function PantryView({ menu, orders, onBack, onUpdateMenu, onSetStatus, onDeleteOrder, onRefresh }) {
  const [authed, setAuthed] = useState(false);
  const [pinTry, setPinTry] = useState("");
  const [pinErr, setPinErr] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [tab, setTab] = useState("orders");

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <TopBar onBack={onBack} title="Pantry access" subtitle="Staff only" />
        <div style={{ flex: 1, display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ width: "100%", maxWidth: 400, background: T.card,
            border: "1px solid " + T.border, borderRadius: 20, padding: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14,
              background: T.ink + "10", color: T.ink,
              display: "grid", placeItems: "center", marginBottom: 20 }}>
              <Lock size={20} />
            </div>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 600,
              margin: "0 0 6px", letterSpacing: "-0.01em" }}>Enter staff PIN</h2>
            <p style={{ color: T.muted, fontSize: 14, margin: "0 0 24px" }}>
              Ask your supervisor for the pantry access PIN.
            </p>
            <div style={{ position: "relative" }}>
              <input autoFocus type={showPin ? "text" : "password"} inputMode="numeric"
                placeholder="••••" value={pinTry}
                onChange={(e) => { setPinTry(e.target.value); setPinErr(false); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (pinTry === PANTRY_PIN) setAuthed(true); else setPinErr(true);
                  }
                }}
                style={{ ...inputStyle, paddingRight: 44, letterSpacing: 6, fontSize: 18, textAlign: "center" }} />
              <button onClick={() => setShowPin(s => !s)} style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", cursor: "pointer",
                color: T.muted, padding: 6,
              }}>
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {pinErr && (
              <div style={{ color: "#991b1b", fontSize: 13, marginTop: 10,
                display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={14} /> Incorrect PIN
              </div>
            )}
            <button onClick={() => pinTry === PANTRY_PIN ? setAuthed(true) : setPinErr(true)}
              style={{ ...primaryBtn, width: "100%", marginTop: 16, justifyContent: "center" }}>
              Unlock <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = orders.filter(o => o.status !== "delivered").length;

  return (
    <div>
      <TopBar onBack={onBack} title="Pantry dashboard"
        subtitle={activeCount > 0 ? `${activeCount} active order${activeCount !== 1 ? "s" : ""}` : "All caught up"}
        right={<button onClick={onRefresh} style={iconBtn} title="Refresh"><RefreshCw size={16} /></button>} />
      <Tabs value={tab} onChange={setTab} items={[
        { key: "orders", label: `Orders${activeCount ? ` (${activeCount})` : ""}` },
        { key: "menu",   label: "Manage Menu" },
      ]} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px 80px" }}>
        {tab === "orders"
          ? <PantryOrders orders={orders} onSetStatus={onSetStatus} onDelete={onDeleteOrder} />
          : <PantryMenuMgmt menu={menu} onUpdate={onUpdateMenu} />}
      </div>
    </div>
  );
}

function PantryOrders({ orders, onSetStatus, onDelete }) {
  if (!orders.length) {
    return <EmptyState IconC={Coffee} title="No orders yet"
      text="Once someone places an order, it'll appear here in real time." />;
  }
  const sorted = [...orders].sort((a, b) => {
    if (a.status === "delivered" && b.status !== "delivered") return 1;
    if (a.status !== "delivered" && b.status === "delivered") return -1;
    return b.placedAt - a.placedAt;
  });
  const advance = (id, currentStatus) => {
    const idx = STATUSES.findIndex(s => s.key === currentStatus);
    const ns = STATUSES[Math.min(idx + 1, STATUSES.length - 1)].key;
    onSetStatus(id, ns);
  };
  const remove = (id) => {
    if (!confirm("Remove this order from the list?")) return;
    onDelete(id);
  };
  return (
    <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
      {sorted.map(o => (
        <OrderCard key={o.id} order={o}
          onAdvance={() => advance(o.id, o.status)}
          onSetStatus={(s) => onSetStatus(o.id, s)}
          onRemove={() => remove(o.id)} editable />
      ))}
    </div>
  );
}

function PantryMenuMgmt({ menu, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("hot");

  const toggle = (id) => onUpdate(menu.map(m => m.id === id ? { ...m, inStock: !m.inStock } : m));
  const remove = (id) => {
    if (!confirm("Remove this item from the menu?")) return;
    onUpdate(menu.filter(m => m.id !== id));
  };
  const addItem = () => {
    const name = newName.trim();
    if (!name) return;
    const id = "custom-" + Date.now().toString(36);
    onUpdate([...menu, { id, name, category: newCat, inStock: true, custom: true }]);
    setNewName(""); setAdding(false);
  };

  const grouped = {
    hot:   menu.filter(m => m.category === "hot"),
    cold:  menu.filter(m => m.category === "cold"),
    snack: menu.filter(m => m.category === "snack"),
  };

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ background: T.card, border: "1px solid " + T.border,
        borderRadius: 16, padding: 18, marginBottom: 20 }}>
        {!adding ? (
          <button onClick={() => setAdding(true)} style={{ ...primaryBtn, background: T.ink }}>
            <Plus size={16} /> Add new item
          </button>
        ) : (
          <div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600,
              marginBottom: 12, letterSpacing: "-0.01em" }}>New menu item</div>
            <div style={{ display: "grid", gap: 10 }}>
              <input placeholder="Item name (e.g. Green Tea)" value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addItem()}
                autoFocus style={inputStyle} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(CATEGORIES).map(([k, v]) => {
                  const IconC = ICONS[v.iconKey];
                  const active = newCat === k;
                  return (
                    <button key={k} onClick={() => setNewCat(k)} style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 999,
                      background: active ? T.ink : T.cream,
                      color: active ? "#fff" : T.ink,
                      border: "1px solid " + (active ? T.ink : T.border),
                      cursor: "pointer", fontWeight: 500, fontSize: 13, fontFamily: FONT_BODY,
                    }}>
                      <IconC size={13} /> {v.label}
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button onClick={addItem} disabled={!newName.trim()}
                  style={{ ...primaryBtn, opacity: newName.trim() ? 1 : 0.5 }}>
                  <Check size={15} /> Save item
                </button>
                <button onClick={() => { setAdding(false); setNewName(""); }} style={ghostBtn}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {Object.entries(grouped).map(([catKey, items]) => {
        const meta = CATEGORIES[catKey];
        const IconC = ICONS[meta.iconKey];
        return (
          <section key={catKey} style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <IconC size={18} color={meta.accent} />
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600,
                margin: 0, letterSpacing: "-0.01em" }}>{meta.label}</h2>
              <div style={{ flex: 1, height: 1, background: T.borderS, marginLeft: 6 }} />
              <span style={{ color: T.muted, fontSize: 13 }}>{items.length} item{items.length !== 1 ? "s" : ""}</span>
            </div>
            {items.length === 0 ? (
              <div style={{ color: T.muted, fontSize: 14, fontStyle: "italic" }}>No items in this category.</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {items.map(it => (
                  <div key={it.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: T.card, border: "1px solid " + T.border,
                    borderRadius: 12, padding: "12px 14px",
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 500, color: T.ink }}>
                        {it.name}
                      </div>
                      {it.custom && (
                        <div style={{ fontSize: 11, color: T.accent, fontWeight: 500,
                          textTransform: "uppercase", letterSpacing: 0.6, marginTop: 2 }}>Custom</div>
                      )}
                    </div>
                    <StockToggle inStock={it.inStock} onToggle={() => toggle(it.id)} />
                    <button onClick={() => remove(it.id)}
                      style={{ ...iconBtn, color: "#991b1b" }} title="Remove item">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function StockToggle({ inStock, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      padding: "6px 12px", borderRadius: 999,
      background: inStock ? "#dcfce7" : "#fee2e2",
      color: inStock ? "#166534" : "#991b1b",
      border: "1px solid " + (inStock ? "#bbf7d0" : "#fecaca"),
      fontSize: 12, fontWeight: 600, cursor: "pointer",
      fontFamily: FONT_BODY, letterSpacing: 0.3,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%",
        background: inStock ? "#16a34a" : "#dc2626" }} />
      {inStock ? "IN STOCK" : "OUT"}
    </button>
  );
}

// ============================================================================
//  ORDER CARD (shared)
// ============================================================================
function OrderCard({ order, onAdvance, onSetStatus, onRemove, editable, compact }) {
  const status = STATUSES.find(s => s.key === order.status) || STATUSES[0];
  const StatusIcon = ICONS[status.iconKey];
  const idx = STATUSES.findIndex(s => s.key === order.status);
  const nextStatus = STATUSES[Math.min(idx + 1, STATUSES.length - 1)];
  const isLast = order.status === "delivered";

  return (
    <div style={{
      background: T.card, border: "1px solid " + T.border,
      borderRadius: 16, overflow: "hidden",
      opacity: order.status === "delivered" ? 0.78 : 1,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14,
        padding: 18, borderBottom: "1px solid " + T.borderS }}>
        <div style={{ width: 38, height: 38, borderRadius: 10,
          background: status.bg, color: status.fg,
          display: "grid", placeItems: "center", flexShrink: 0 }}>
          <StatusIcon size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10,
            flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 600,
              color: T.ink, letterSpacing: "-0.01em" }}>{order.employeeName}</span>
            <span style={{ fontSize: 11, color: status.fg, background: status.bg,
              padding: "3px 8px", borderRadius: 999, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: 0.6 }}>{status.label}</span>
          </div>
          <div style={{ fontSize: 12, color: T.muted, fontFamily: "ui-monospace, monospace" }}>
            {order.id} • {timeAgo(order.placedAt)}
          </div>
        </div>
        {editable && !isLast && (
          <button onClick={onAdvance} style={{
            ...primaryBtn, padding: "8px 12px", fontSize: 13, background: status.dot }}>
            <ChevronRight size={14} /> {nextStatus.label}
          </button>
        )}
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ fontSize: 11, color: T.muted, fontWeight: 600,
          textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>Items</div>
        <div style={{ display: "grid", gap: 6 }}>
          {order.items.map(i => (
            <div key={i.id} style={{ display: "flex", justifyContent: "space-between",
              fontSize: 14.5, color: T.ink2 }}>
              <span>{i.name}</span>
              <span style={{ fontWeight: 600, color: T.ink }}>×{i.qty}</span>
            </div>
          ))}
        </div>
        {!compact && editable && (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + T.borderS,
            display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: T.muted, fontWeight: 500, marginRight: 4 }}>
              Set status:
            </span>
            {STATUSES.map(s => {
              const active = s.key === order.status;
              return (
                <button key={s.key} onClick={() => onSetStatus(s.key)} style={{
                  padding: "5px 10px", borderRadius: 999, fontSize: 12,
                  fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY,
                  border: "1px solid " + (active ? s.dot : T.border),
                  background: active ? s.bg : "transparent",
                  color: active ? s.fg : T.muted, letterSpacing: 0.3,
                }}>{s.label}</button>
              );
            })}
            <div style={{ flex: 1 }} />
            <button onClick={onRemove}
              style={{ ...iconBtn, color: "#991b1b" }} title="Delete order">
              <Trash2 size={14} />
            </button>
          </div>
        )}
        {compact && <ProgressTrack status={order.status} />}
      </div>
    </div>
  );
}

function ProgressTrack({ status }) {
  const idx = STATUSES.findIndex(s => s.key === status);
  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + T.borderS,
      display: "flex", gap: 4 }}>
      {STATUSES.map((s, i) => {
        const reached = i <= idx;
        return (
          <div key={s.key} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 4, borderRadius: 999, marginBottom: 6,
              background: reached ? s.dot : T.borderS, transition: "background 250ms" }} />
            <div style={{ fontSize: 10.5, fontWeight: 600,
              color: reached ? s.fg : T.muted,
              textTransform: "uppercase", letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
//  SHARED PIECES
// ============================================================================
function TopBar({ onBack, title, subtitle, right }) {
  return (
    <div style={{ borderBottom: "1px solid " + T.borderS,
      background: "rgba(255,255,255,0.78)", backdropFilter: "blur(8px)",
      WebkitBackdropFilter: "blur(8px)", position: "sticky", top: 0, zIndex: 20 }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "10px 20px 6px", borderBottom: "1px dashed " + T.borderS,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Wordmark size="sm" />
        <span style={{
          fontSize: 10, color: T.muted, fontWeight: 600,
          letterSpacing: 1.6, textTransform: "uppercase",
        }}>Internal · Office WiFi only</span>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto",
        display: "flex", alignItems: "center", gap: 12, padding: "12px 20px 14px" }}>
        <button onClick={onBack} style={iconBtn}><ArrowLeft size={16} /></button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600,
            color: T.ink, lineHeight: 1.1, letterSpacing: "-0.01em" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>{subtitle}</div>}
        </div>
        {right}
      </div>
    </div>
  );
}

function Tabs({ value, onChange, items }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto",
      padding: "16px 20px 0", display: "flex", gap: 6 }}>
      {items.map(it => {
        const active = it.key === value;
        return (
          <button key={it.key} onClick={() => onChange(it.key)} style={{
            padding: "9px 16px", borderRadius: 999,
            background: active ? T.ink : "transparent",
            color: active ? "#fff" : T.ink2,
            border: "1px solid " + (active ? T.ink : T.border),
            cursor: "pointer", fontWeight: 600, fontSize: 13.5,
            fontFamily: FONT_BODY, letterSpacing: 0.2, transition: "all 180ms",
          }}>{it.label}</button>
        );
      })}
    </div>
  );
}

function EmptyState({ IconC, title, text }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px",
      background: T.card, border: "1px dashed " + T.border,
      borderRadius: 18, marginTop: 24 }}>
      <div style={{ width: 56, height: 56, borderRadius: 16,
        background: T.cream, color: T.muted,
        display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
        <IconC size={22} />
      </div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 600,
        color: T.ink, marginBottom: 6, letterSpacing: "-0.01em" }}>{title}</div>
      <div style={{ color: T.muted, fontSize: 14, maxWidth: 360, margin: "0 auto" }}>{text}</div>
    </div>
  );
}

function Toast({ kind, text }) {
  const isErr = kind === "error";
  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 100, background: isErr ? "#7f1d1d" : T.ink, color: "#fff",
      padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500,
      boxShadow: "0 12px 30px -8px rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", gap: 8,
      animation: "slideDown 250ms ease",
    }}>
      <Check size={16} /> {text}
    </div>
  );
}

// ============================================================================
//  STYLES
// ============================================================================
const primaryBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: T.accent, color: "#fff", border: "none",
  borderRadius: 12, padding: "11px 18px",
  fontWeight: 600, fontSize: 14, cursor: "pointer",
  fontFamily: FONT_BODY, letterSpacing: 0.2,
  transition: "transform 120ms, background 180ms",
};
const ghostBtn = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "transparent", color: T.ink2,
  border: "1px solid " + T.border, borderRadius: 12, padding: "11px 18px",
  fontWeight: 500, fontSize: 14, cursor: "pointer", fontFamily: FONT_BODY,
};
const iconBtn = {
  width: 36, height: 36, borderRadius: 10,
  background: "transparent", border: "1px solid " + T.border,
  color: T.ink2, cursor: "pointer",
  display: "inline-grid", placeItems: "center",
  transition: "background 150ms",
};
const qtyBtn = {
  width: 30, height: 30, borderRadius: 8,
  background: T.card, border: "1px solid " + T.border,
  cursor: "pointer", display: "grid", placeItems: "center", color: T.ink2,
};
const qtyBtnDark = {
  width: 26, height: 26, borderRadius: 6,
  background: "rgba(255,255,255,0.15)", border: "none",
  cursor: "pointer", display: "grid", placeItems: "center", color: "#fff",
};
const inputStyle = {
  width: "100%", padding: "12px 14px",
  background: T.cream, border: "1px solid " + T.border,
  borderRadius: 12, fontSize: 15, color: T.ink,
  fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box",
};

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return s + "s ago";
  if (s < 3600)  return Math.floor(s/60) + "m ago";
  if (s < 86400) return Math.floor(s/3600) + "h ago";
  return Math.floor(s/86400) + "d ago";
}

// ============================================================================
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

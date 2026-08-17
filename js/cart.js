/**
 * Cart state — stored in the browser's localStorage so it survives a
 * page refresh. Each item in the cart is a "line":
 *   {
 *     lineId: "L-...",              // unique per line, auto-generated
 *     productId: "SKU-01" | "HERO-01",
 *     qty: 2,
 *     customization: null | {       // only set for hero products
 *       name: "Alex",
 *       choices: [{ label: "Colour", value: "Cyan" }, ...],
 *       comment: "Please rush if possible"
 *     }
 *   }
 */
const Cart = {
  KEY: "sundayprint_cart_v2",

  read() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEY));
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  write(lines) {
    localStorage.setItem(this.KEY, JSON.stringify(lines));
    document.dispatchEvent(new CustomEvent("cart:changed"));
  },

  makeLineId() {
    return "L-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  },

  // Regular (non-customized) products: adding the same product again
  // just increases its quantity.
  addSimple(productId, qty = 1) {
    const lines = this.read();
    const existing = lines.find((l) => l.productId === productId && !l.customization);
    if (existing) {
      existing.qty += qty;
    } else {
      lines.push({ lineId: this.makeLineId(), productId, qty, customization: null });
    }
    this.write(lines);
  },

  // Hero/made-to-order products: each submission is its own line,
  // since two orders for the same product may have different
  // personalization.
  addCustom(productId, customization, qty = 1) {
    const lines = this.read();
    lines.push({ lineId: this.makeLineId(), productId, qty, customization });
    this.write(lines);
  },

  setQty(lineId, qty) {
    let lines = this.read();
    if (qty <= 0) {
      lines = lines.filter((l) => l.lineId !== lineId);
    } else {
      const line = lines.find((l) => l.lineId === lineId);
      if (line) line.qty = qty;
    }
    this.write(lines);
  },

  remove(lineId) {
    const lines = this.read().filter((l) => l.lineId !== lineId);
    this.write(lines);
  },

  clear() {
    this.write([]);
  },

  // Returns [{ lineId, product, qty, customization, lineTotal }]
  lines() {
    return this.read()
      .map((line) => {
        const product = ALL_PRODUCTS.find((p) => p.id === line.productId);
        if (!product) return null;
        return {
          lineId: line.lineId,
          product,
          qty: line.qty,
          customization: line.customization,
          lineTotal: +(product.price * line.qty).toFixed(2)
        };
      })
      .filter(Boolean);
  },

  count() {
    return this.read().reduce((sum, l) => sum + l.qty, 0);
  },

  subtotal() {
    return +this.lines().reduce((sum, line) => sum + line.lineTotal, 0).toFixed(2);
  }
};

/**
 * Cart state — stored in the browser's localStorage so it survives a
 * page refresh. Each item in the cart is a "line":
 *   {
 *     lineId: "L-...",              // unique per line, auto-generated
 *     productId: "SKU-01" | "HERO-01" | ...,
 *     qty: 2,
 *     selections: {                 // whatever the customer filled in/picked
 *       name: "Alex", emoji: "🦄 Unicorn", baseColour: "Cyan", ...
 *     },
 *     unitPrice: 13                 // price at the time it was added
 *                                    // (snapshotted so later price-table
 *                                    // edits don't change items already
 *                                    // sitting in someone's cart)
 *   }
 */
const Cart = {
  KEY: "sundayprint_cart_v3",

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

  // Adds a product with its selections (may be {} for a plain product
  // with no options at all). Two lines merge into one only if it's
  // the same product with the exact same selections — e.g. two "Cyan"
  // organisers merge, but a "Cyan" and a "Pink" one stay separate.
  add(productId, selections, qty, unitPrice) {
    selections = selections || {};
    const lines = this.read();
    const key = JSON.stringify(selections);
    const existing = lines.find((l) => l.productId === productId && JSON.stringify(l.selections || {}) === key);

    if (existing) {
      existing.qty += qty;
    } else {
      lines.push({ lineId: this.makeLineId(), productId, qty, selections, unitPrice });
    }
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

  // Returns [{ lineId, product, qty, selections, unitPrice, lineTotal }]
  lines() {
    return this.read()
      .map((line) => {
        const product = ALL_PRODUCTS.find((p) => p.id === line.productId);
        if (!product) return null;
        const unitPrice = typeof line.unitPrice === "number" ? line.unitPrice : product.price;
        return {
          lineId: line.lineId,
          product,
          qty: line.qty,
          selections: line.selections || {},
          unitPrice,
          lineTotal: +(unitPrice * line.qty).toFixed(2)
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

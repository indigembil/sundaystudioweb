/* Renders the hero (made-to-order) products, the regular product grid,
   the cart drawer, and the email signup form. */

function money(n) {
  return `$${n.toFixed(2)}`;
}

function getFieldLabel(product, key) {
  const field = (product.customization && product.customization.fields || []).find((f) => f.key === key);
  return field ? field.label.replace(/\s*\(.*?\)\s*$/, "") : key; // trims "(2-10 characters...)" hints from labels
}

/* ---------------- hero / made-to-order products ---------------- */

function renderHeroFieldHtml(product, field) {
  if (field.type === "dropdown") {
    return `
      <div class="field">
        <label for="${product.id}-${field.key}">${field.label}</label>
        <select id="${product.id}-${field.key}" data-key="${field.key}">
          ${field.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
        </select>
      </div>`;
  }
  // text field
  return `
    <div class="field">
      <label for="${product.id}-${field.key}">${field.label}</label>
      <input
        type="text"
        id="${product.id}-${field.key}"
        data-key="${field.key}"
        placeholder="${field.placeholder || ""}"
        ${field.minLength ? `minlength="${field.minLength}"` : ""}
        ${field.maxLength ? `maxlength="${field.maxLength}"` : ""}
        ${field.required ? "required" : ""}
      />
      <span class="field-error">Please fill this in before adding to your bag.</span>
    </div>`;
}

function renderHeroProducts() {
  const grid = document.getElementById("heroProductGrid");

  grid.innerHTML = HERO_PRODUCTS.map((p) => {
    const fieldsHtml = p.customization.fields.map((f) => renderHeroFieldHtml(p, f)).join("");
    const isDynamicPricing = p.pricing && p.pricing.type === "perCharacter";

    return `
      <article class="hero-card" data-hero-id="${p.id}">
        ${p.tag ? `<span class="tag-badge">${p.tag}</span>` : ""}
        <div class="hero-top">
          <div class="hero-emoji">${p.emoji}</div>
          <div>
            <h3>${p.name}</h3>
            <p class="hero-desc">${p.description}</p>
            <p class="price-tag" data-price-display>
              ${isDynamicPricing ? `From ${money(p.price)}` : money(p.price)}
            </p>
          </div>
        </div>

        <form class="hero-form" data-hero-form="${p.id}">
          ${fieldsHtml}
          <button type="submit" class="add-btn">Add to Bag +</button>
        </form>
      </article>
    `;
  }).join("");

  HERO_PRODUCTS.forEach((p) => {
    const card = grid.querySelector(`[data-hero-id="${p.id}"]`);
    const form = card.querySelector("[data-hero-form]");
    const priceDisplay = card.querySelector("[data-price-display]");

    function currentSelections() {
      const selections = {};
      form.querySelectorAll("[data-key]").forEach((el) => {
        selections[el.dataset.key] = el.value.trim ? el.value.trim() : el.value;
      });
      return selections;
    }

    function updateLivePrice() {
      if (!(p.pricing && p.pricing.type === "perCharacter")) return;
      const selections = currentSelections();
      const raw = selections[p.pricing.field] || "";
      if (!raw) {
        priceDisplay.textContent = `From ${money(p.price)}`;
        return;
      }
      const price = calculatePrice(p, selections);
      priceDisplay.textContent = money(price);
    }

    if (p.pricing && p.pricing.type === "perCharacter") {
      const nameInput = form.querySelector(`[data-key="${p.pricing.field}"]`);
      nameInput.addEventListener("input", updateLivePrice);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll("[required]").forEach((input) => {
        const errorEl = input.parentElement.querySelector(".field-error");
        if (!input.value.trim()) {
          valid = false;
          if (errorEl) errorEl.classList.add("show");
        } else if (errorEl) {
          errorEl.classList.remove("show");
        }
      });
      if (!valid) return;

      const selections = currentSelections();
      const unitPrice = calculatePrice(p, selections);
      Cart.add(p.id, selections, 1, unitPrice);
      showToast("Added to your bag! 🎀");
      form.reset();
      updateLivePrice();
    });
  });
}

/* ---------------- regular ready-made grid ---------------- */

function renderProducts() {
  const grid = document.getElementById("productGrid");
  grid.innerHTML = PRODUCTS.map((p) => {
    const soldOut = p.stock <= 0;
    const media = p.image
      ? `<img class="tile-photo" src="${p.image}" alt="${p.name}" />`
      : `<span class="tile-emoji">${p.emoji}</span>`;
    const colourOptions = (p.colours || [])
      .map((c) => `<option value="${c}">${c}</option>`)
      .join("");

    return `
      <article class="tile size-${p.size}" data-id="${p.id}">
        ${media}
        ${p.tag ? `<span class="tile-badge">${p.tag}</span>` : ""}
        <div class="tile-info">
          <h3>${p.name}</h3>
          <p class="desc">${p.description}</p>
          <p class="price-tag">${money(p.price)}</p>
          ${
            p.colours && p.colours.length
              ? `<div class="field tile-colour-field">
                   <label for="${p.id}-colour">Colour</label>
                   <select id="${p.id}-colour" data-colour-for="${p.id}">${colourOptions}</select>
                 </div>`
              : ""
          }
          <button class="add-btn" data-add="${p.id}" ${soldOut ? "disabled" : ""}>
            ${soldOut ? "Sold Out" : "Add to Bag +"}
          </button>
        </div>
        ${soldOut ? `<span class="sold-out-stamp">SOLD OUT</span>` : ""}
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.add;
      const product = PRODUCTS.find((p) => p.id === id);
      const colourSelect = grid.querySelector(`[data-colour-for="${id}"]`);
      const selections = colourSelect ? { colour: colourSelect.value } : {};
      Cart.add(id, selections, 1, product.price);
      showToast("Added to your bag! 🎀");
    });
  });
}

/* ---------------- cart drawer ---------------- */

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const lines = Cart.lines();

  document.getElementById("cartCount").textContent = Cart.count();
  document.getElementById("cartSubtotal").textContent = money(Cart.subtotal());

  if (lines.length === 0) {
    itemsEl.innerHTML = `<div class="cart-empty"><span class="big-emoji">🎈</span>Your bag is empty.<br />Go find something cute!</div>`;
    return;
  }

  itemsEl.innerHTML = lines.map((line) => {
    const entries = Object.entries(line.selections || {});
    const customHtml = entries.length
      ? `<div class="custom-summary">
           ${entries.map(([key, value]) => `<strong>${getFieldLabel(line.product, key)}:</strong> ${value}`).join(" · ")}
         </div>`
      : "";

    return `
      <div class="cart-item" data-line-id="${line.lineId}">
        <div class="thumb">${line.product.image ? "" : line.product.emoji}</div>
        <div class="info">
          <h4>${line.product.name}</h4>
          <div class="unit-price">${money(line.unitPrice)} each</div>
          ${customHtml}
          <div class="qty-controls">
            <button data-decrease>−</button>
            <span>${line.qty}</span>
            <button data-increase>+</button>
            <button class="remove-item" data-remove>remove</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  itemsEl.querySelectorAll(".cart-item").forEach((el) => {
    const lineId = el.dataset.lineId;
    const current = Cart.lines().find((l) => l.lineId === lineId);
    el.querySelector("[data-increase]").addEventListener("click", () =>
      Cart.setQty(lineId, current.qty + 1)
    );
    el.querySelector("[data-decrease]").addEventListener("click", () =>
      Cart.setQty(lineId, current.qty - 1)
    );
    el.querySelector("[data-remove]").addEventListener("click", () => Cart.remove(lineId));
  });

  // Re-render PayPal buttons so the amount stays in sync with the cart
  if (typeof renderPayPalButtons === "function") renderPayPalButtons();
}

function openCartDrawer() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("overlay").classList.add("open");
}
function closeCartDrawer() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---------------- email signup (Netlify Forms) ---------------- */

function setupNewsletterForm() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    // Netlify Forms works without any JS at all (a normal page reload
    // submits it fine). This just makes it feel nicer by avoiding the
    // reload, when the browser supports it.
    e.preventDefault();
    const data = new FormData(form);
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(data).toString()
    })
      .then(() => {
        showToast("You're on the list! 💌");
        form.reset();
      })
      .catch(() => {
        // Fall back to a normal submit if the fetch failed for any reason
        form.submit();
      });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderHeroProducts();
  renderProducts();
  renderCart();
  setupNewsletterForm();

  document.getElementById("openCart").addEventListener("click", openCartDrawer);
  document.getElementById("closeCart").addEventListener("click", closeCartDrawer);
  document.getElementById("overlay").addEventListener("click", closeCartDrawer);
  document.addEventListener("cart:changed", renderCart);

  // Friendly confirmation after returning from Stripe checkout
  const params = new URLSearchParams(window.location.search);
  if (params.get("success") === "true") {
    Cart.clear();
    showToast("Thank you! Your order is confirmed 💌");
  } else if (params.get("canceled") === "true") {
    showToast("Checkout canceled — your bag is still saved.");
  }
});

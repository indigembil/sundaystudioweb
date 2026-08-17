/* Renders the hero (made-to-order) products, the regular product grid,
   and wires up the cart drawer UI. */

function money(n) {
  return `$${n.toFixed(2)}`;
}

/* ---------------- hero / made-to-order products ---------------- */

function renderHeroProducts() {
  const grid = document.getElementById("heroProductGrid");

  grid.innerHTML = HERO_PRODUCTS.map((p) => {
    const c = p.customization;
    const dropdownsHtml = c.dropdowns
      .map((d, i) => `
        <div class="field">
          <label for="${p.id}-dd-${i}">${d.label}</label>
          <select id="${p.id}-dd-${i}" data-dropdown-index="${i}">
            ${d.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("")}
          </select>
        </div>
      `)
      .join("");

    return `
      <article class="hero-card" data-hero-id="${p.id}">
        ${p.tag ? `<span class="tag-badge">${p.tag}</span>` : ""}
        <div class="hero-top">
          <div class="hero-emoji">${p.emoji}</div>
          <div>
            <h3>${p.name}</h3>
            <p class="hero-desc">${p.description}</p>
            <p class="price-tag">${money(p.price)}</p>
          </div>
        </div>

        <form class="hero-form" data-hero-form="${p.id}">
          <div class="field">
            <label for="${p.id}-name">${c.nameField.label}</label>
            <input type="text" id="${p.id}-name" placeholder="${c.nameField.placeholder}" required />
            <span class="field-error">Please fill this in before adding to your bag.</span>
          </div>

          <div class="dropdown-row">
            ${dropdownsHtml}
          </div>

          <div class="field">
            <label for="${p.id}-comment">${c.comment.label}</label>
            <textarea id="${p.id}-comment" placeholder="${c.comment.placeholder}"></textarea>
          </div>

          <button type="submit" class="add-btn">Add to Bag +</button>
        </form>
      </article>
    `;
  }).join("");

  grid.querySelectorAll("[data-hero-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const heroId = form.dataset.heroForm;
      const product = HERO_PRODUCTS.find((p) => p.id === heroId);
      const nameInput = form.querySelector(`#${heroId}-name`);
      const errorEl = form.querySelector(".field-error");

      if (!nameInput.value.trim()) {
        errorEl.classList.add("show");
        nameInput.focus();
        return;
      }
      errorEl.classList.remove("show");

      const choices = product.customization.dropdowns.map((d, i) => ({
        label: d.label,
        value: form.querySelector(`[data-dropdown-index="${i}"]`).value
      }));

      const customization = {
        name: nameInput.value.trim(),
        choices,
        comment: form.querySelector(`#${heroId}-comment`).value.trim()
      };

      Cart.addCustom(heroId, customization, 1);
      showToast("Added to your bag! 🎀");
      form.reset();
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

    return `
      <article class="tile size-${p.size}" data-id="${p.id}">
        ${media}
        ${p.tag ? `<span class="tile-badge">${p.tag}</span>` : ""}
        <div class="tile-info">
          <h3>${p.name}</h3>
          <p class="desc">${p.description}</p>
          <p class="price-tag">${money(p.price)}</p>
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
      Cart.addSimple(btn.dataset.add, 1);
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
    const custom = line.customization;
    const customHtml = custom
      ? `<div class="custom-summary">
           <strong>Name:</strong> ${custom.name}<br />
           ${custom.choices.map((c) => `<strong>${c.label}:</strong> ${c.value}`).join(" · ")}
           ${custom.comment ? `<br /><strong>Note:</strong> ${custom.comment}` : ""}
         </div>`
      : "";

    return `
      <div class="cart-item" data-line-id="${line.lineId}">
        <div class="thumb">${line.product.image ? "" : line.product.emoji}</div>
        <div class="info">
          <h4>${line.product.name}</h4>
          <div class="unit-price">${money(line.product.price)} each</div>
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

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderHeroProducts();
  renderProducts();
  renderCart();

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

/**
 * PayPal Smart Buttons integration.
 *
 * This renders PayPal's own official button, which handles the whole
 * PayPal payment flow (including "Pay with card via PayPal" for buyers
 * without a PayPal account). Prices always come from ALL_PRODUCTS in
 * js/products.js, matched by SKU id — so a customer can never pay a
 * different amount than what's actually in the catalog. Any Name /
 * dropdown / comment personalization is attached as the item
 * description so it shows up in your PayPal order details.
 *
 * Setup required: replace YOUR_PAYPAL_CLIENT_ID in index.html with
 * your real PayPal Client ID. See SETUP-GUIDE.md.
 */

function summarizeCustomization(customization) {
  if (!customization) return "";
  const parts = [`Name: ${customization.name}`];
  customization.choices.forEach((c) => parts.push(`${c.label}: ${c.value}`));
  if (customization.comment) parts.push(`Note: ${customization.comment}`);
  // PayPal item descriptions are limited to 127 characters.
  return parts.join(" | ").slice(0, 127);
}

function renderPayPalButtons() {
  const container = document.getElementById("paypal-button-container");
  if (!container || typeof paypal === "undefined") return;

  container.innerHTML = "";

  paypal.Buttons({
    style: { shape: "pill", color: "gold", layout: "horizontal", label: "paypal", height: 45 },

    createOrder: function (data, actions) {
      const lines = Cart.lines();
      if (lines.length === 0) {
        showToast("Your bag is empty! Add something cute first 🎀");
        return Promise.reject(new Error("empty cart"));
      }

      const items = lines.map((l) => ({
        name: l.product.name.slice(0, 127),
        description: summarizeCustomization(l.customization),
        unit_amount: { currency_code: "AUD", value: l.product.price.toFixed(2) },
        quantity: String(l.qty)
      }));

      const itemTotal = Cart.subtotal();

      return actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: "AUD",
              value: itemTotal.toFixed(2),
              breakdown: { item_total: { currency_code: "AUD", value: itemTotal.toFixed(2) } }
            },
            items
          }
        ]
      });
    },

    onApprove: function (data, actions) {
      return actions.order.capture().then(function (details) {
        Cart.clear();
        showToast(`Thank you, ${details.payer.name.given_name}! 💌 Order confirmed.`);
        closeCartDrawer();
      });
    },

    onError: function (err) {
      console.error(err);
      showToast("PayPal isn't connected yet — see SETUP-GUIDE.md");
    }
  }).render("#paypal-button-container");
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof paypal !== "undefined") renderPayPalButtons();
});

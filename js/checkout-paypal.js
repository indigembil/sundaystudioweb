/**
 * PayPal Smart Buttons integration.
 *
 * This renders PayPal's own official button, which handles the whole
 * PayPal payment flow (including "Pay with card via PayPal" for buyers
 * without a PayPal account). Whatever was typed/picked in an order
 * form (name, colour, emoji, etc) is attached as the item description
 * so it shows up in your PayPal order details.
 *
 * Known limitation: unlike the Stripe flow, this confirms the price
 * using the browser directly (the amount already calculated and
 * stored in the cart) rather than re-checking it on a server. For a
 * small shop the risk is low; ask if you'd like server-side PayPal
 * verification added later.
 *
 * Shipping: unlike Stripe Checkout, PayPal's button here has no
 * built-in "pick your shipping option" step, so every PayPal order
 * automatically includes the flat AU_SHIPPING amount below. If a
 * PayPal customer actually wanted Local Pickup, refund them that
 * amount by hand afterwards — see "Shipping & postage" in
 * SETUP-GUIDE.md. EDIT AU_SHIPPING to change the amount.
 *
 * Setup required: replace YOUR_PAYPAL_CLIENT_ID in index.html with
 * your real PayPal Client ID. See SETUP-GUIDE.md.
 */

const AU_SHIPPING = 10; // flat rate, AUD — added to every PayPal order

function summarizeSelectionsForPayPal(product, selections) {
  const entries = Object.entries(selections || {});
  if (!entries.length) return "";
  const summary = entries.map(([key, value]) => `${getFieldLabel(product, key)}: ${value}`).join(" | ");
  // PayPal item descriptions are limited to 127 characters.
  return summary.slice(0, 127);
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
        description: summarizeSelectionsForPayPal(l.product, l.selections),
        unit_amount: { currency_code: "AUD", value: l.unitPrice.toFixed(2) },
        quantity: String(l.qty)
      }));

      const itemTotal = Cart.subtotal();
      const shipping = AU_SHIPPING;
      const orderTotal = +(itemTotal + shipping).toFixed(2);

      return actions.order.create({
        purchase_units: [
          {
            amount: {
              currency_code: "AUD",
              value: orderTotal.toFixed(2),
              breakdown: {
                item_total: { currency_code: "AUD", value: itemTotal.toFixed(2) },
                shipping: { currency_code: "AUD", value: shipping.toFixed(2) }
              }
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

/**
 * Stripe Checkout integration.
 *
 * How it works:
 *   1. Customer clicks "Pay with Card".
 *   2. Browser sends the cart contents — product id, quantity, and
 *      whatever was typed/picked in the order form (name, colours,
 *      emoji, etc.) — to a small serverless function
 *      (netlify/functions/create-checkout-session.js).
 *   3. That function talks to Stripe using your SECRET key (kept safe
 *      on the server, never in this file) and creates a Checkout
 *      Session. The PRICE is calculated server-side from
 *      js/products.js (including the Name Clicker's per-character
 *      price table), so nobody can tamper with the price by editing
 *      the page in their browser's dev tools — only the personalization
 *      text comes from the browser, which is safe since it doesn't
 *      affect what's charged.
 *   4. The customer is redirected to Stripe's own secure hosted
 *      checkout page to enter their card details.
 *
 * You do NOT need to put any Stripe key in this file. The only setup
 * required is adding STRIPE_SECRET_KEY as an environment variable in
 * your Netlify site settings — see SETUP-GUIDE.md.
 */

async function startStripeCheckout() {
  const lines = Cart.lines();
  if (lines.length === 0) {
    showToast("Your bag is empty! Add something cute first 🎀");
    return;
  }

  const button = document.getElementById("stripeCheckout");
  const originalText = button.textContent;
  button.disabled = true;
  button.textContent = "Redirecting…";

  try {
    const res = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({
          id: l.product.id,
          qty: l.qty,
          selections: l.selections
        }))
      })
    });

    if (!res.ok) throw new Error("Checkout session request failed");
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // hand off to Stripe's hosted page
    } else {
      throw new Error("No checkout URL returned");
    }
  } catch (err) {
    console.error(err);
    showToast("Card checkout isn't connected yet — see SETUP-GUIDE.md");
    button.disabled = false;
    button.textContent = originalText;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("stripeCheckout");
  if (btn) btn.addEventListener("click", startStripeCheckout);
});

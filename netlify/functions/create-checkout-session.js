/**
 * Serverless function that creates a Stripe Checkout Session.
 *
 * IMPORTANT — this is what makes the checkout safe:
 * Prices are calculated HERE, on the server, straight from
 * js/products.js — including the Name Clicker's per-character price
 * table. The browser only ever sends product IDs, quantities, and
 * personalization text (name/colour/emoji/etc) — never a price — so
 * nobody can tamper with what's charged by editing the page in their
 * browser's dev tools. Personalization text is included in the line
 * item description so you can see exactly what to print, right in
 * your Stripe dashboard.
 *
 * Requires one environment variable, set in Netlify's dashboard:
 *   STRIPE_SECRET_KEY   (starts with sk_live_... or sk_test_...)
 *
 * See SETUP-GUIDE.md for exactly where to add this.
 */

const Stripe = require("stripe");
const { ALL_PRODUCTS, calculatePrice } = require("../../js/products.js");

function summarizeSelections(product, selections) {
  const entries = Object.entries(selections || {});
  if (!entries.length) return "";
  const fields = (product.customization && product.customization.fields) || [];
  const labelFor = (key) => {
    const field = fields.find((f) => f.key === key);
    return field ? field.label.replace(/\s*\(.*?\)\s*$/, "") : key;
  };
  return entries.map(([key, value]) => `${labelFor(key)}: ${value}`).join(" | ").slice(0, 500);
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "STRIPE_SECRET_KEY is not set. Add it in Netlify > Site settings > Environment variables."
      })
    };
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { items } = JSON.parse(event.body || "{}");
    if (!Array.isArray(items) || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "Cart is empty" }) };
    }

    const line_items = items.map(({ id, qty, selections }) => {
      const product = ALL_PRODUCTS.find((p) => p.id === id);
      if (!product) throw new Error(`Unknown product id: ${id}`);
      if (product.stock !== undefined && product.stock <= 0) {
        throw new Error(`${product.name} is sold out`);
      }

      const price = calculatePrice(product, selections); // server-side, trusted
      const summary = summarizeSelections(product, selections);
      const description = summary ? `${product.description} — ${summary}` : product.description;

      return {
        quantity: Math.max(1, qty || 1),
        price_data: {
          currency: "aud",
          unit_amount: Math.round(price * 100), // Stripe uses cents
          product_data: { name: product.name, description }
        }
      };
    });

    const siteUrl = process.env.URL || "http://localhost:8888";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      shipping_address_collection: { allowed_countries: ["AU", "NZ", "US", "GB", "CA"] },
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/?canceled=true`
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};

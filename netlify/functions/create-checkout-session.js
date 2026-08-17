/**
 * Serverless function that creates a Stripe Checkout Session.
 *
 * IMPORTANT — this is what makes the checkout safe:
 * Prices are looked up HERE, on the server, straight from
 * js/products.js. The browser only ever sends product IDs, quantities,
 * and personalization text (name/colour/etc) — never prices — so
 * nobody can tamper with the price by editing the page in their
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
const { ALL_PRODUCTS } = require("../../js/products.js");

function summarizeCustomization(customization) {
  if (!customization) return "";
  const parts = [`Name: ${customization.name}`];
  (customization.choices || []).forEach((c) => parts.push(`${c.label}: ${c.value}`));
  if (customization.comment) parts.push(`Note: ${customization.comment}`);
  return parts.join(" | ").slice(0, 500);
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

    const line_items = items.map(({ id, qty, customization }) => {
      const product = ALL_PRODUCTS.find((p) => p.id === id);
      if (!product) throw new Error(`Unknown product id: ${id}`);
      if (product.stock !== undefined && product.stock <= 0) {
        throw new Error(`${product.name} is sold out`);
      }

      const customSummary = summarizeCustomization(customization);
      const description = customSummary
        ? `${product.description} — ${customSummary}`
        : product.description;

      return {
        quantity: Math.max(1, qty || 1),
        price_data: {
          currency: "aud",
          unit_amount: Math.round(product.price * 100), // Stripe uses cents
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

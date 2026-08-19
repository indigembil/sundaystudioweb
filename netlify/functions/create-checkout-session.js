/**
 * Serverless function that creates a Stripe Checkout Session.
 *
 * IMPORTANT — this is what makes the checkout safe:
 * Prices are calculated HERE, on the server, straight from
 * js/products.js — including the Name Clicker's per-character price
 * table. The browser only ever sends product IDs, quantities, and
 * personalization text (name/colour/emoji/etc) — never a price — so
 * nobody can tamper with what's charged by editing the page in their
 * browser's dev tools. Personalization text is included in each line
 * item's description AND rolled up into one whole-order summary
 * (payment_intent_data.description / metadata.order_summary) so the
 * full order shows up as its own column in Stripe's Payments list and
 * CSV export — no need to click into every payment. See "Seeing what
 * was ordered" in SETUP-GUIDE.md.
 *
 * Shipping: customers choose between flat-rate Standard Shipping and
 * $0 Local Pickup right on Stripe's checkout page (Australia only for
 * now). See "Shipping & postage" in SETUP-GUIDE.md to change the rate,
 * the pickup address, or add more countries later.
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

// A short one-line-per-item summary, e.g. "2x Desk Cable Organiser (Colour: Cyan)".
// Several of these get joined together so the WHOLE ORDER shows up as one
// line in Stripe's Payments list and CSV export — not just buried inside
// each individual payment's detail page.
function buildLineSummary(product, qty, selections) {
  const custom = summarizeSelections(product, selections);
  return custom ? `${qty}x ${product.name} (${custom})` : `${qty}x ${product.name}`;
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

    const qtyByItem = items.map(({ qty }) => Math.max(1, qty || 1));
    const lineSummaries = [];

    const line_items = items.map(({ id, qty, selections }, i) => {
      const product = ALL_PRODUCTS.find((p) => p.id === id);
      if (!product) throw new Error(`Unknown product id: ${id}`);
      if (product.stock !== undefined && product.stock <= 0) {
        throw new Error(`${product.name} is sold out`);
      }

      const price = calculatePrice(product, selections); // server-side, trusted
      const summary = summarizeSelections(product, selections);
      const description = summary ? `${product.description} — ${summary}` : product.description;
      lineSummaries.push(buildLineSummary(product, qtyByItem[i], selections));

      return {
        quantity: qtyByItem[i],
        price_data: {
          currency: "aud",
          unit_amount: Math.round(price * 100), // Stripe uses cents
          product_data: { name: product.name, description }
        }
      };
    });

    // The whole order as one readable line, e.g.
    // "1x Name Clicker (Name: Alexa | Emoji: Unicorn...); 1x Bag Tag (...)"
    // This goes into both `description` (shows as its own column in the
    // Payments list and CSV export) and `metadata.order_summary` (shows
    // as its own field on the payment detail page too) — so you don't
    // have to click into every single payment to see what was ordered.
    const orderSummary = lineSummaries.join("; ").slice(0, 490);

    const siteUrl = process.env.URL || "http://localhost:8888";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      // Australia only for now — there's no rate defined for other
      // countries yet, and the flat $10 below would undercharge real
      // international postage. Add more countries here once you have
      // real rates for them (see "Shipping & postage" in SETUP-GUIDE.md).
      shipping_address_collection: { allowed_countries: ["AU"] },
      // Two choices shown on Stripe's hosted checkout page: a flat-rate
      // shipping option and a $0 local pickup option. EDIT THE AMOUNTS
      // here to change pricing — see "Shipping & postage" in SETUP-GUIDE.md.
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 1000, currency: "aud" }, // $10.00
            display_name: "Standard Shipping (Australia)",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 }
            }
          }
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "aud" },
            display_name: "Local Pickup — 3028 Seabrook, VIC"
          }
        }
      ],
      // Stripe still asks for a shipping address even if the customer
      // picks Local Pickup (there's no way to skip that step per
      // option) — this note tells them it's fine either way.
      custom_text: {
        shipping_address: {
          message: "Choosing Local Pickup? Any address is fine here — we'll contact you to arrange collection from 3028 Seabrook, VIC instead of posting it."
        }
      },
      payment_intent_data: {
        description: orderSummary,
        metadata: {
          order_summary: orderSummary,
          item_count: String(items.length)
        }
      },
      success_url: `${siteUrl}/?success=true`,
      cancel_url: `${siteUrl}/?canceled=true`
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};

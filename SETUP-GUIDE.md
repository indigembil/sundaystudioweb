# Sunday Print Studio — Setup Guide

This is a fully working online shop (kawaii x bento box design, brand
palette white/cyan/purple/pink) for **sundayprint.store**, built as
plain HTML/CSS/JS so it can be hosted for free. It's wired up for
**Stripe** (credit/debit card) and **PayPal** checkout, but both need
your own accounts connected before real payments will work.

Note: the storefront displays as "Sunday Print Studio" (matching your
logo) while the domain/email are the shorter sundayprint.store — that's
a normal, common split (full brand name on the page, tidy domain).

Nothing in this guide requires coding experience — it's copy, paste,
and click buttons on websites.

---

## 0. What this costs, realistically

| Item | Cost | Notes |
|---|---|---|
| Domain `sundayprint.store` | ~$1–2 first year, then **~$40+/year** renewal | `.store` domains have cheap intro pricing then jump. Shop around (see step 1). |
| Website hosting (Netlify) | **$0/month** | Free tier easily covers a small shop like this. |
| Stripe card processing | **$0/month**, ~2.9% + $0.30 per sale | No monthly fee — only pay when you actually sell something. |
| PayPal processing | **$0/month**, ~3.49% + $0.49 per sale | Same — pay-per-sale only. |
| Email mailbox (hello@sundayprint.store) | **~$1.60/month** (Migadu Micro, $19/year) | See step 5 for cheaper/alternative options. |

**Realistic ongoing cost: about $2–4/month**, plus the yearly domain
renewal, plus small per-sale payment fees. There is no plan in this
guide that costs more than that unless you choose to.

---

## 1. Register sundayprint.store

1. Go to a registrar — Namecheap, Cloudflare Registrar, or Porkbun are
   all reputable and among the cheaper options for `.store` domains.
2. Search `sundayprint.store` and check it's available.
3. **Before buying, compare the renewal price**, not just the first-year
   price — registrars advertise a cheap first year then charge much
   more on renewal. Cloudflare Registrar sells at-cost with no markup,
   which is often the cheapest long-term option for `.store`.
4. Buy it. Skip any upsells (site builder, extra email, "premium DNS"
   — you don't need them for this setup).

You now own the domain but it doesn't point anywhere yet — that
happens in step 3.

---

## 2. Put the website online (Netlify, free)

1. Create a free account at **netlify.com**.
2. The easiest path: create a free **GitHub** account too, upload this
   whole project folder as a new GitHub repository, then in Netlify
   click **"Add new site" → "Import an existing project"** and connect
   that repository. Netlify will auto-detect the `netlify.toml` file
   already included here.
   - Alternative with no GitHub: in Netlify, use **"Deploy manually"**
     and drag-and-drop this whole project folder onto the page. This
     works for the website itself, but the Stripe card-payment
     function needs the GitHub method (or Netlify CLI) to deploy
     correctly — see the note in step 4.
3. Once deployed, Netlify gives you a random address like
   `sundayprint-store.netlify.app` — the site is now live there.

---

## 3. Connect your sundayprint.store domain

1. In Netlify: **Site settings → Domain management → Add a domain** →
   enter `sundayprint.store`.
2. Netlify shows you DNS records to add. Go to your domain registrar's
   DNS settings and add them exactly as shown (usually one A record
   and one CNAME for `www`).
3. DNS changes can take anywhere from a few minutes to a few hours to
   go live. Netlify also gives you a free HTTPS certificate
   automatically once it's connected — no extra cost or setup.

---

## 4. Turn on card payments (Stripe)

1. Create a free account at **stripe.com**.
2. While testing, stay in **Test mode** (toggle in the Stripe
   dashboard) — this lets you run fake orders with test card number
   `4242 4242 4242 4242` (any future expiry, any CVC) with no real
   money moving.
3. Go to **Developers → API keys** and copy the **Secret key**
   (starts with `sk_test_...`).
4. In Netlify: **Site settings → Environment variables → Add a
   variable**:
   - Key: `STRIPE_SECRET_KEY`
   - Value: paste your Stripe secret key
5. Redeploy the site (Netlify does this automatically after you add an
   environment variable and trigger a new deploy).
6. Test it: add something to the bag on your live site and click
   **Pay with Card** — it should redirect to a real Stripe checkout
   page.
7. **When you're ready to accept real payments:** in Stripe, complete
   your business details to activate the account, switch to **Live
   mode**, copy the **new live secret key** (starts with `sk_live_...`),
   and replace the Netlify environment variable with that value.

Why this is safe: your Stripe secret key is never visible on the
website itself — it lives only in Netlify's environment variables and
is used by a small server-side function (`netlify/functions/create-checkout-session.js`).
Prices are also read from `js/products.js` on the server side, so a
customer can't tamper with the price in their browser.

---

## 5. Turn on PayPal payments

1. Create a free **PayPal Business** account (or use your existing
   one) at paypal.com.
2. Go to **developer.paypal.com → Apps & Credentials**, and copy the
   **Client ID** shown under "Default Application" (use the *Sandbox*
   one first for testing, then the *Live* one when you're ready).
3. Open `index.html` in this project and find this line near the top:
   ```html
   <script src="https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=AUD&intent=capture"></script>
   ```
   Replace `YOUR_PAYPAL_CLIENT_ID` with your real Client ID.
4. Save, re-upload/redeploy to Netlify.
5. Test on your live site — the gold PayPal button should now appear
   in the cart drawer and complete a real (or sandbox) PayPal payment.

**Known limitation to be aware of:** unlike the Stripe flow, the
PayPal button currently confirms the order amount using the browser
directly (this is normal for a simple PayPal Buttons setup). For a
small shop like this the risk is low, but if you scale up and want the
same server-side price protection Stripe has, ask to add PayPal
webhook verification later — it's a small addition, not a rebuild.

---

## 6. Set up your work mailbox (hello@sundayprint.store)

A real inbox on your own domain (not just a redirect) needs a small
paid plan — genuinely free options are unreliable or region-locked.
Cheapest solid option found:

- **Migadu — "Micro" plan, $19/year (~$1.60/month)** for one mailbox
  on your own domain, includes normal email client access (not just
  browser-only). migadu.com

Alternatives worth a quick look before you commit, since pricing
changes over time and I haven't tested these directly:
- **Zoho Mail** — has a free tier (5 users, 5GB) but availability
  depends on which region your account is created in; worth checking
  at signup rather than assuming it's free.
- **Purelymail** — pay-as-you-go pricing, historically very cheap for
  a single mailbox; check current pricing at purelymail.com.

Setup is the same regardless of provider: sign up, verify you own
`sundayprint.store` (they'll give you a DNS record to add, same place
you added the Netlify records), create the mailbox `hello@sundayprint.store`
(or `orders@`, your choice), and you can send/receive from it in any
email app.

---

## 7. Managing your shop day-to-day

- **To add, remove, or edit products:** open `js/products.js` — every
  product is a plain block with name, price, description, and a few
  other fields. Instructions are in comments at the top of the file.
  Keep `HERO_PRODUCTS` (2) + `PRODUCTS` between 5–10 total for the
  layout to look its best.
- **To edit the two "Made to Order" hero products** (Name Clicker and
  Bag Tag) and their order forms: same file, top section
  (`HERO_PRODUCTS`). Each has a `customization.fields` list — every
  entry is either a text box (`type: "text"`) or a dropdown
  (`type: "dropdown"`, with its own `options` list you can freely add
  to or trim). Add, remove, or reorder fields by editing that list;
  renaming a label or editing dropdown options is just editing plain
  text — no other file needs to change.
- **To change the Name Clicker's pricing:** still in `HERO_PRODUCTS`,
  find `pricing: { type: "perCharacter", ... table: { 2: 7, 3: 9, ... } }`.
  Each `number: price` pair means "this many characters in the name =
  this price." Edit any price, e.g. change `3: 9` to `3: 10` to charge
  $10 for a 3-character name. The smallest and largest numbers in the
  table automatically become the minimum/maximum characters a customer
  can type — so if you add `11: 22`, customers can now type up to 11
  characters. An emoji in the name counts as one character, same as a
  letter.
- **To mark something sold out:** set its `stock` to `0` — the site
  automatically shows a "Sold Out" stamp and disables the button. All
  6 regular shop products are currently set to `stock: 0` (they're
  tagged "COMING SOON"), so the button says "Sold Out" underneath that
  badge — change `stock` to a real number whenever one is ready to
  sell, and the button re-enables automatically.
- **To add real photos instead of the placeholder graphic:** drop an
  image file into the `images` folder and change that product's
  `image` field to e.g. `"images/my-photo.jpg"`. Every regular product
  currently points at the same placeholder (`images/placeholder-product.png`)
  so it's obvious at a glance which ones still need a real photo. The
  two hero products (Name Clicker, Bag Tag) each have a `photos` list
  of 3 — 2 of those now point at your real photos, and the 3rd is
  still the placeholder on both; send another photo any time and I'll
  (or you can) swap it in.
- **To charge extra for a specific dropdown option** (like the Name
  Clicker's emoji, which is +$2 for anything except "None"): add
  `extraCost: 2, freeOption: "None"` to that field in
  `customization.fields`. The surcharge applies whenever the customer's
  selection isn't equal to `freeOption`. This works on any dropdown
  field on either hero product, not just emoji — change the number or
  add it to another field the same way.
- **To relabel a regular product's dropdown** (e.g. "Style" instead of
  "Colour" for Food Fidget Toys, since its options are French
  Fries/Sushi/Burger, not colours): add `colourLabel: "Style"` next to
  that product's `colours` list.
- **Made-to-order details show up in your dashboards:** whatever a
  customer types or picks (name, colours, emoji, emergency contact,
  etc) travels through to both Stripe and PayPal, so you'll see
  exactly what to print for each order without a separate system.
- **Every change:** save the file, then re-deploy (if using GitHub,
  just commit and push — Netlify redeploys automatically in about a
  minute; if using drag-and-drop, re-drag the folder).
- **Orders:** Stripe orders appear in your Stripe dashboard under
  Payments. PayPal orders appear in your PayPal account activity.
  There's no separate "orders admin" in this simple setup — your
  Stripe/PayPal dashboards are your order list.

### Seeing what was ordered, in Stripe, without clicking into every payment

For every **new** order placed from now on, the whole order (every item,
qty, and customization — name, colours, emoji, emergency contact, etc)
is written into the payment's **Description** field, right on the main
list:

1. Log into Stripe → **Payments** in the left sidebar.
2. You'll see a **Description** column in the table — for a Name
   Clicker + Bag Tag order it'll read something like
   `1x Name Clicker (Name to print: Alexa | Emoji: 🦄 Unicorn | Base
   Colour: Cyan...); 2x Bag Tag (Name: Max | ...)`. That's the whole
   order, in one row, no clicking required.
3. To get it as an actual table file: click **Export** above the list
   (or **More → Export payments**), choose a date range, and download
   the CSV. The Description column comes through as its own spreadsheet
   column, so you can open it in Excel/Google Sheets and filter/sort
   your orders like a real order table.
4. The same text is also saved under that payment's **Metadata** as
   `order_summary`, in case you ever need it from the API instead of
   the dashboard.

**Two things worth knowing [certain]:**
- This only applies **going forward** — it's a code change, so it
  can't rewrite orders that were already placed before you deployed
  this update. For any older order, you'll still need to open that
  specific payment to see its line-item descriptions.
- **PayPal doesn't get this same order-level summary.** PayPal's
  transaction list only shows per-item descriptions the way it already
  did — there's no equivalent "whole order in one field" for PayPal
  orders in this setup [certain, based on how the PayPal integration
  is built]. If most of your real orders end up going through PayPal
  rather than Stripe, this fix won't help you there, and you'd still
  be opening individual PayPal transactions to see the details. Let me
  know if that's a problem in practice and I can look at ways to
  summarize PayPal orders too (e.g. logging them somewhere on your
  side at checkout time).

---

## 7b. Social links (Instagram / TikTok / Facebook)

The footer icons currently link to `#` (nowhere). Open `index.html`,
find the `<!-- EDIT: replace href="#" -->` comment near the bottom,
and replace each `href="#"` with your real profile URL, e.g.
`href="https://instagram.com/sundayprintstudio"`. Save, commit,
redeploy — same as any other change.

---

## 7c. Your mailing list (email signups)

The "Join the club" box under the banner uses **Netlify Forms** — a
free feature already built into your hosting, so there's no extra
service to sign up for and no cost.

- **To see who signed up:** in Netlify, click your site, then the
  **"Forms"** tab. You'll see a form called "newsletter" with every
  email address anyone has submitted.
- **To export the list:** most Netlify plans let you download form
  submissions as a CSV file from that same Forms tab — handy for
  importing into an email tool later (like Mailchimp) when you're
  ready to actually send discount code emails.
- **Free tier limit:** Netlify's free plan includes 100 form
  submissions per month across your whole site [likely — worth
  double-checking against Netlify's current pricing page once you're
  close to that many signups, since free-tier limits do change over
  time]. That's just how many people can join the list per month for
  free — plenty to start with.
- **Sending the actual discount emails is a separate step:** right now
  this form only collects addresses, it doesn't send anything back
  automatically. When you're ready to email your list, export the CSV
  and use a tool like Mailchimp or Beehiiv (both have free tiers for
  small lists) to actually send campaigns.

---

## 7d. Shipping & postage

Shipping is currently set up as **Australia-only, flat rate**, with
card and PayPal customers handled differently because of a real
limitation in how each one works.

**Card (Stripe):** on Stripe's own checkout page, the customer picks
one of two options themselves:
- **Standard Shipping (Australia)** — $10 flat
- **Local Pickup — 3028 Seabrook, VIC** — $0

Stripe still asks for a shipping address either way (there's no way to
skip that step per option), so there's a small note on that page
telling pickup customers any address is fine there — you'll contact
them separately to arrange collection.

- **To change the $10 rate or add delivery estimate days:** edit
  `shipping_options` in `netlify/functions/create-checkout-session.js`
  — the amount is in cents (`1000` = $10.00).
- **To change the pickup address or wording:** edit the
  `display_name` on the second `shipping_options` entry, and the
  `custom_text.shipping_address.message` just below it.
- **To open shipping to more countries:** edit
  `shipping_address_collection: { allowed_countries: ["AU"] }` in the
  same file. Only do this once you know what to actually charge for
  postage there — right now the $10 rate is Australia-only and would
  likely undercharge international shipping.

**PayPal:** PayPal's button on this site doesn't have Stripe's
built-in "pick your shipping option" step, so **every PayPal order
automatically includes the $10 flat shipping** — there's no pickup
option in the PayPal flow itself. If a customer pays via PayPal and
actually wanted Local Pickup, refund them the $10 shipping portion by
hand afterwards (the cart footer note on the site tells customers to
message you for this).

- **To change the $10 amount:** edit the `AU_SHIPPING` constant near
  the top of `js/checkout-paypal.js`.

**Not built yet, flagged so it's not forgotten:** real-time AusPost
rates based on parcel size. That's a bigger integration — it needs an
AusPost developer/business account and a size/weight lookup per order
— and wasn't built into this round of changes. The flat $10 rate above
is the placeholder until that's worth doing. Let me know if you'd
like to scope that out next.

---

## 8. Pre-launch checklist

- [ ] Domain registered and DNS pointed at Netlify
- [ ] Site loads at `https://sundayprint.store`
- [ ] Stripe secret key added to Netlify, test purchase completed
- [ ] Stripe account activated and switched to live key
- [ ] PayPal Client ID added, test purchase completed, switched to live
- [ ] Mailbox created and tested (send yourself a test email)
- [ ] Product list reviewed — real names, prices, descriptions, stock
- [ ] Shipping/returns info added somewhere customers can find it (not
      included by default — let me know if you'd like a policy page
      added)

---

## Honest caveats

- I could not create your Stripe, PayPal, Netlify, domain registrar,
  or mailbox accounts for you — all of those require your real
  identity and payment details, so they need to be done by you,
  following the steps above.
- This is a genuinely minimal setup: no order-tracking database, no
  automatic inventory sync, no discount codes, no customer accounts.
  That's what keeps it free/cheap. If the shop grows past ~10 products
  or you want those features, a platform like Big Cartel becomes worth
  its monthly fee.

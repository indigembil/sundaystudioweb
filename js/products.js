/**
 * ============================================================
 *  SUNDAY PRINT STUDIO — PRODUCT CATALOG
 * ============================================================
 *  This is the ONLY file you need to edit to change what's for
 *  sale, including the two hero/signature customizable products
 *  at the top of the page. No coding knowledge required — just
 *  follow the pattern below.
 * ============================================================
 */

/**
 * HERO_PRODUCTS — your 2 signature, made-to-order items. Each one
 * gets a big featured tile with an order form: a Name field, 4
 * dropdown selectors, and a comment box. Customers fill this out
 * before adding it to their bag, so you know exactly what to print.
 *
 *   id, name, price, description, emoji, image, tag  → same as
 *      regular products below.
 *
 *   customization.nameField.label       → label above the text input
 *   customization.nameField.placeholder → grey hint text inside it
 *
 *   customization.dropdowns             → EXACTLY 4 entries. Each one:
 *     label    → what the dropdown is called (e.g. "Color")
 *     options  → the list of choices shown — EDIT THESE FREELY,
 *                add/remove as many options as you like per dropdown.
 *
 *   customization.comment.label / placeholder → the notes box.
 */
const HERO_PRODUCTS = [
  {
    id: "HERO-01",
    name: "Name Clicker",
    price: 8.9,
    description: "A 3D-printed fidget clicker, personalised with your name — satisfying to click, fun to carry.",
    emoji: "🔘",
    image: "",
    tag: "Made to order",
    customization: {
      nameField: { label: "Name to print", placeholder: "e.g. Alex" },
      dropdowns: [
        { label: "Colour", options: ["White", "Cyan", "Purple", "Pink", "Black"] },
        { label: "Size", options: ["Small (3cm)", "Medium (5cm)"] },
        { label: "Font Style", options: ["Rounded", "Bold Sans", "Script", "Minimal"] },
        { label: "Attachment", options: ["Keyring Loop", "Standalone", "Lanyard Loop"] }
      ],
      comment: { label: "Notes for us (optional)", placeholder: "Anything else we should know about your order?" }
    }
  },
  {
    id: "HERO-02",
    name: "Bag Tag",
    price: 11.9,
    description: "A personalised 3D-printed bag or luggage tag with your name, ready to clip on and go.",
    emoji: "🏷️",
    image: "",
    tag: "Made to order",
    customization: {
      nameField: { label: "Name to print", placeholder: "e.g. Alex" },
      dropdowns: [
        { label: "Colour", options: ["White", "Cyan", "Purple", "Pink", "Black"] },
        { label: "Size", options: ["Small (5cm)", "Medium (7cm)"] },
        { label: "Font Style", options: ["Rounded", "Bold Sans", "Script", "Minimal"] },
        { label: "Attachment", options: ["Strap Loop", "Carabiner Clip", "Zip Tie Loop"] }
      ],
      comment: { label: "Notes for us (optional)", placeholder: "Anything else we should know about your order?" }
    }
  }
];

/**
 * PRODUCTS — your regular, ready-made catalog (no customization
 * form, just a straightforward "Add to Bag"). Same fields as before:
 *   id, name, price, description, emoji, image, tag, size, stock
 * "size" controls the bento tile shape: small / medium / large / wide / tall
 * Keep HERO_PRODUCTS (2) + PRODUCTS between 3–8 for a total of 5–10 SKUs.
 */
const PRODUCTS = [
  {
    id: "SKU-01",
    name: "Desk Cable Organiser",
    price: 14,
    description: "3D-printed clip tray keeps 4 cables tangle-free on your desk.",
    emoji: "🧵",
    image: "",
    tag: "Best Seller",
    size: "medium",
    stock: 22
  },
  {
    id: "SKU-02",
    name: "Mini Planter Pot (Set of 2)",
    price: 12.5,
    description: "Two small geometric planter pots with drainage tray, 8cm.",
    emoji: "🪴",
    image: "",
    tag: "",
    size: "small",
    stock: 30
  },
  {
    id: "SKU-03",
    name: "Geometric Phone Stand",
    price: 16,
    description: "Adjustable-angle phone stand, works with most phone cases.",
    emoji: "📱",
    image: "",
    tag: "New",
    size: "medium",
    stock: 18
  },
  {
    id: "SKU-04",
    name: "LED Nightlight Shade",
    price: 22,
    description: "Lithophane-style nightlight shade, fits standard LED tea lights.",
    emoji: "🌙",
    image: "",
    tag: "",
    size: "wide",
    stock: 10
  },
  {
    id: "SKU-05",
    name: "Stackable Coaster Set",
    price: 18,
    description: "Set of 4 coasters with matching stand, cork-backed.",
    emoji: "☕",
    image: "",
    tag: "",
    size: "small",
    stock: 20
  },
  {
    id: "SKU-06",
    name: "Cord Clip Multipack",
    price: 7.5,
    description: "Pack of 8 adhesive cord clips in mixed sizes.",
    emoji: "🔌",
    image: "",
    tag: "",
    size: "small",
    stock: 40
  }
];

// Combined list — used internally, no need to edit.
const ALL_PRODUCTS = [...HERO_PRODUCTS, ...PRODUCTS];

// Do not edit below this line — this makes the catalog available
// to the rest of the site.
if (typeof module !== "undefined") module.exports = { HERO_PRODUCTS, PRODUCTS, ALL_PRODUCTS };

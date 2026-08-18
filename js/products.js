/**
 * ============================================================
 *  SUNDAY PRINT STUDIO — PRODUCT CATALOG
 * ============================================================
 *  This is the ONLY file you need to edit to change what's for
 *  sale, including the two hero/signature made-to-order products
 *  at the top of the page. No coding knowledge required — just
 *  follow the pattern below.
 * ============================================================
 */

/**
 * countCharacters — counts how many "letters" are in a bit of text,
 * where an emoji counts as ONE character (not 2 or 4, which is how
 * computers normally see them). Used for the Name Clicker's pricing.
 * You don't need to edit this.
 */
function countCharacters(str) {
  str = (str || "").trim();
  if (!str) return 0;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(str)).length;
  }
  return Array.from(str).length;
}

/**
 * calculatePrice — works out the real price of a line item.
 *   - Fixed-price products: just returns product.price.
 *   - "perCharacter" products (the Name Clicker): looks up the price
 *     table below using however many characters are in the name.
 * You don't need to edit this either — edit the PRICE TABLE inside
 * HERO_PRODUCTS instead.
 */
function calculatePrice(product, selections) {
  const pricing = product.pricing || { type: "fixed" };
  if (pricing.type !== "perCharacter") return product.price;

  const raw = (selections && selections[pricing.field]) || "";
  const len = countCharacters(raw);
  const table = pricing.table;
  const sizes = Object.keys(table).map(Number).sort((a, b) => a - b);
  const min = sizes[0];
  const max = sizes[sizes.length - 1];
  const clamped = Math.max(min, Math.min(max, len));
  return table[clamped];
}

/**
 * HERO_PRODUCTS — your 2 signature, made-to-order items. Each one
 * gets a big featured tile with an order form built from "fields".
 *
 *   fields — the list of boxes shown on the form, in order. Each one is:
 *     { type: "text", key: "...", label: "...", placeholder: "...",
 *       minLength, maxLength, required }
 *     { type: "dropdown", key: "...", label: "...", options: [...] }
 *   You can add, remove, or reorder fields freely. "key" is just an
 *   internal name — keep it short, no spaces, don't reuse a key twice
 *   in the same product.
 *
 *   pricing — how the price is worked out:
 *     { type: "fixed" }  → always product.price
 *     { type: "perCharacter", field: "name", table: { 2: 7, 3: 9, ... } }
 *       → price depends on how many characters are typed into the
 *         field named "field". EDIT THE TABLE to change prices —
 *         e.g. change `3: 9` to `3: 10` to charge $10 for 3 characters.
 *         Whatever the smallest/largest numbers in your table are
 *         become the minimum/maximum characters allowed.
 */
const HERO_PRODUCTS = [
  {
    id: "HERO-01",
    name: "Name Clicker",
    price: 7, // starting price shown before the customer types a name
    description: "A 3D-printed fidget clicker with your name on it. Pricing depends on how many characters you print",
    emoji: "🦄",
    image: "",
    // 3 example photos shown as little polaroids on this card. Replace
    // each path with a real photo any time — drop the file into
    // /images and point these at it, e.g. "images/clicker-1.jpg".
    photos: [
      "images/picture1.png",
      "images/picture2.png",
      "images/picture3.png"
    ],
    tag: "Made to order",
    pricing: {
      type: "perCharacter",
      field: "name",
      table: { 2: 7, 3: 9, 4: 11, 5: 13, 6: 15, 7: 17, 8: 18, 9: 19, 10: 20 }
    },
    customization: {
      fields: [
        {
          type: "text",
          key: "name",
          label: "Name to print (2–10 characters — letters, numbers or emoji)",
          placeholder: "e.g. Alex",
          minLength: 2,
          maxLength: 10,
          required: true
        },
        {
          // EDIT THIS LIST to change which decorative emoji customers can pick.
          type: "dropdown",
          key: "emoji",
          label: "Emoji",
          options: ["None", "Bow", "Cat", "Duck", "Flower", "Star", "Love Heart", "Music", "Moon", "Dog Paw", "Plane", "Soccer Ball", "Basket Ball", "Grape", "Coffee cup"]
        },
        {
          type: "dropdown",
          key: "baseColour",
          label: "Base Colour",
          options: ["White", "Caramel", "Brown", "Green", "Cyan", "Purple", "Pink", "Yellow", "Orange", "Red", "Grey", "Black"]
        },
        {
          type: "dropdown",
          key: "letterColour",
          label: "Letter Colour",
          options: ["White", "Caramel", "Brown", "Green", "Cyan", "Purple", "Pink", "Yellow", "Orange", "Red", "Grey", "Black"]
        },
        {
          type: "dropdown",
          key: "buttonColour",
          label: "Button Colour",
          options: ["White", "Caramel", "Brown", "Green", "Cyan", "Purple", "Pink", "Yellow", "Orange", "Red", "Grey", "Black"]
        }
      ]
    }
  },
  {
    id: "HERO-02",
    name: "Bag Tag",
    price: 11.9,
    description: "A personalised 3D-printed bag or luggage tag with a name and emergency contact (that you can tap & connect!)",
    emoji: "🏷️",
    image: "",
    // 3 example photos shown as little polaroids on this card. Replace
    // each path with a real photo any time — drop the file into
    // /images and point these at it, e.g. "images/bagtag-1.jpg".
    photos: [
      "images/picture4.png",
      "images/picture3.png",
      "images/placeholder-product.png"
    ],
    tag: "Made to order",
    pricing: { type: "fixed" },
    customization: {
      fields: [
        { type: "text", key: "name", label: "Name", placeholder: "e.g. Alex", required: true },
        {
          type: "text",
          key: "emergencyContact",
          label: "Emergency Contact",
          placeholder: "e.g. Mum - 0400 000 000",
          required: true
        },
        {
          type: "dropdown",
          key: "colour",
          label: "Colour",
          options: ["White", "Caramel", "Brown", "Green", "Cyan", "Purple", "Pink", "Yellow", "Orange", "Red", "Grey", "Black"]
        }
      ]
    }
  }
];

/**
 * PRODUCTS — your regular, ready-made catalog. No custom form, just a
 * Colour dropdown and an "Add to Bag" button.
 *   id, name, price, description, emoji, image, tag, size, stock  → as before.
 *   colours → the list of colour choices shown on this product's tile.
 *             EDIT FREELY, add or remove colours per product.
 *   image   → currently points at a shared placeholder graphic so you
 *             can see where photos will go. Replace with a real photo
 *             any time: drop the file into /images and change this to
 *             e.g. "images/my-photo.jpg".
 */
const PRODUCTS = [
  {
    id: "SKU-01",
    name: "Food Fidget Toys",
    price: 13,
    description: "Food-themed fidget toy, to crave your hunger and need to click",
    emoji: "🧵",
    image: "images/placeholder-product.png",
    tag: "COMING SOON",
    size: "medium",
    stock: 22,
    colours: ["French Fries", "Sushi", "Burger", "Coffee", "Wonka Bar"]
  },
  {
    id: "SKU-02",
    name: "Mini Planter Pot (Set of 2)",
    price: 15,
    description: "Two small geometric planter pots with drainage tray, 8cm.",
    emoji: "🪴",
    image: "images/placeholder-product.png",
    tag: "COMING SOON",
    size: "small",
    stock: 30,
    colours: ["White", "Cyan", "Purple", "Pink"]
  },
  {
    id: "SKU-03",
    name: "Geometric Phone Stand",
    price: 10,
    description: "Adjustable-angle phone stand, works with most phone cases.",
    emoji: "📱",
    image: "images/placeholder-product.png",
    tag: "COMING SOON",
    size: "medium",
    stock: 18,
    colours: ["White", "Cyan", "Purple", "Pink", "Black"]
  },
  {
    id: "SKU-04",
    name: "LED Nightlight Shade",
    price: 25,
    description: "Lithophane-style nightlight shade, fits standard LED tea lights.",
    emoji: "🌙",
    image: "images/placeholder-product.png",
    tag: "COMING SOON",
    size: "wide",
    stock: 10,
    colours: ["White", "Cyan", "Purple", "Pink"]
  },
  {
    id: "SKU-05",
    name: "Stackable Coaster Set",
    price: 18,
    description: "Set of 4 coasters with matching stand, cork-backed.",
    emoji: "☕",
    image: "images/placeholder-product.png",
    tag: "COMING SOON",
    size: "small",
    stock: 20,
    colours: ["White", "Cyan", "Purple", "Pink", "Black"]
  },
  {
    id: "SKU-06",
    name: "Cord Clip Multipack",
    price: 7.5,
    description: "Pack of 8 adhesive cord clips in mixed sizes.",
    emoji: "🔌",
    image: "images/placeholder-product.png",
    tag: "COMING SOON",
    size: "small",
    stock: 40,
    colours: ["White", "Cyan", "Purple", "Pink", "Black"]
  }
];

// Combined list — used internally, no need to edit.
const ALL_PRODUCTS = [...HERO_PRODUCTS, ...PRODUCTS];

// Do not edit below this line — this makes the catalog available
// to the rest of the site.
if (typeof module !== "undefined") {
  module.exports = { HERO_PRODUCTS, PRODUCTS, ALL_PRODUCTS, calculatePrice, countCharacters };
}

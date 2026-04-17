import { BoxSize } from './types';

export const BOX_CATALOG: BoxSize[] = [
  // STANDARD SIZES
  {
    id: 'std-1',
    name: '6×4×4',
    length: 6,
    width: 4,
    height: 4,
    category: 'standard',
    commonUse: 'Small items, cosmetics, candles, small electronics',
    priceEstimate: '$1.20–2.50/box at 250 qty',
  },
  {
    id: 'std-2',
    name: '8×6×4',
    length: 8,
    width: 6,
    height: 4,
    category: 'standard',
    commonUse: 'Books, small apparel, subscription boxes',
    priceEstimate: '$1.60–2.90/box at 250 qty',
  },
  {
    id: 'std-3',
    name: '10×8×6',
    length: 10,
    width: 8,
    height: 6,
    category: 'standard',
    commonUse: 'Medium products, shoes, kits, bundled items',
    priceEstimate: '$2.20–3.50/box at 250 qty',
  },
  {
    id: 'std-4',
    name: '12×10×4',
    length: 12,
    width: 10,
    height: 4,
    category: 'standard',
    commonUse: 'Flat items, apparel, documents, framed items',
    priceEstimate: '$2.30–3.60/box at 250 qty',
  },
  {
    id: 'std-5',
    name: '12×12×8',
    length: 12,
    width: 12,
    height: 8,
    category: 'standard',
    commonUse: 'Medium to large items, small appliances, gift sets',
    priceEstimate: '$2.80–4.30/box at 250 qty',
  },
  {
    id: 'std-6',
    name: '14×10×6',
    length: 14,
    width: 10,
    height: 6,
    category: 'standard',
    commonUse: 'Electronics, tools, medium fragile items',
    priceEstimate: '$2.70–4.00/box at 250 qty',
  },

  // POPULAR CUSTOM
  {
    id: 'pop-1',
    name: '9×6×3',
    length: 9,
    width: 6,
    height: 3,
    category: 'popular_custom',
    commonUse: 'Apparel, flat products, light subscriptions',
    priceEstimate: '$1.80–3.10/box at 250 qty',
  },
  {
    id: 'pop-2',
    name: '11×8×5',
    length: 11,
    width: 8,
    height: 5,
    category: 'popular_custom',
    commonUse: 'Meal kits, beauty boxes, bundled products',
    priceEstimate: '$2.40–3.70/box at 250 qty',
  },
  {
    id: 'pop-3',
    name: '16×12×6',
    length: 16,
    width: 12,
    height: 6,
    category: 'popular_custom',
    commonUse: 'Larger kits, multi-item shipments, wholesale',
    priceEstimate: '$3.10–4.60/box at 250 qty',
  },
  {
    id: 'pop-4',
    name: '18×12×8',
    length: 18,
    width: 12,
    height: 8,
    category: 'popular_custom',
    commonUse: 'Bulk items, heavy products, industrial goods',
    priceEstimate: '$3.80–5.40/box at 250 qty',
  },

  // ANY SIZE
  {
    id: 'any-1',
    name: '7×5×3',
    length: 7,
    width: 5,
    height: 3,
    category: 'any_size',
    commonUse: 'Jewelry, small accessories, samples',
    priceEstimate: '$1.50–2.70/box at 250 qty',
  },
  {
    id: 'any-2',
    name: '10×10×10',
    length: 10,
    width: 10,
    height: 10,
    category: 'any_size',
    commonUse: 'Cube-shaped items, ceramics, round products',
    priceEstimate: '$2.90–4.30/box at 250 qty',
  },
  {
    id: 'any-3',
    name: '20×14×10',
    length: 20,
    width: 14,
    height: 10,
    category: 'any_size',
    commonUse: 'Large items, multipacks, equipment',
    priceEstimate: '$4.10–5.80/box at 250 qty',
  },
  {
    id: 'any-4',
    name: '24×18×6',
    length: 24,
    width: 18,
    height: 6,
    category: 'any_size',
    commonUse: 'Large flat items, posters in tubes, artwork',
    priceEstimate: '$4.30–6.10/box at 250 qty',
  },
];

export const CUSTOMBOXES_LINKS = {
  home: 'https://customboxes.io',
  roi: 'https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators',
  refundPolicy: 'https://customboxes.io/policies/refund-policy',
  largeOrderQuote:
    'https://customboxes.io/pages/large-order-quote-request-form',
  standardBoxes: 'https://customboxes.io/collections/standard-shipping-boxes',
};

export const STEPS = [
  { id: 1, label: 'Enter URL' },
  { id: 2, label: 'Brand Analysis' },
  { id: 3, label: 'Box Size' },
  { id: 4, label: 'Design' },
  { id: 5, label: 'Refine & Export' },
];

export const EXAMPLE_URLS = [
  'https://allbirds.com',
  'https://glossier.com',
  'https://yeti.com',
  'https://bombas.com',
];

export const PRICE_TIERS: { qty: number; pricePerBox: number }[] = [
  { qty: 100, pricePerBox: 3.5 },
  { qty: 250, pricePerBox: 2.9 },
  { qty: 500, pricePerBox: 2.5 },
  { qty: 1000, pricePerBox: 1.8 },
  { qty: 2500, pricePerBox: 1.45 },
  { qty: 5000, pricePerBox: 1.2 },
];

export function estimateCustomBoxPrice(monthlyVolume: number): number {
  let price = PRICE_TIERS[0].pricePerBox;
  for (const tier of PRICE_TIERS) {
    if (monthlyVolume >= tier.qty) {
      price = tier.pricePerBox;
    }
  }
  return price;
}

export const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

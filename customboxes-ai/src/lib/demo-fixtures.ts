import type {
  BrandAnalysis,
  BoxRecommendation,
  BoxSize,
  DesignLayout,
  PanelDesign,
  SizingAnswers,
} from './types';
import { BOX_CATALOG } from './constants';

/* -----------------------------  BRAND FIXTURES  ---------------------------- */

const BRAND_FIXTURES: Record<string, BrandAnalysis> = {
  'allbirds.com': {
    companyName: 'Allbirds',
    tagline: 'Naturally better.',
    valueProposition:
      'Allbirds makes sustainable, comfortable footwear and apparel from natural materials like merino wool, tree fiber, and sugarcane.',
    brandTone: 'eco-friendly',
    targetCustomer:
      'Conscious, design-aware adults who want sustainable everyday basics and comfortable footwear.',
    visualStyle:
      'Warm, minimal, outdoor-leaning photography with a lot of whitespace, earthy tones, and hand-drawn accents.',
    typographyNotes:
      'Clean modern sans with a soft, slightly humanist feel. A serif for special callouts would feel right on pack.',
    messagingSignals: [
      'Naturally better',
      'Made from natural materials',
      'Born in New Zealand',
      'Comfort from the ground up',
      'Sustainably made',
    ],
    colorPalette: ['#F5F1EA', '#2E2A26', '#D7C9B0', '#7EAE7C'],
    recommendedBoxColor: 'kraft',
    designDirection:
      'Lean into the natural, sustainable identity. Kraft substrate, minimal ink coverage, generous whitespace. Let one confident wordmark + a short tagline carry the front; reserve side panels for a sustainability line and the URL.',
    industryCategory: 'Apparel & footwear',
  },
  'bombas.com': {
    companyName: 'Bombas',
    tagline: 'Better is better.',
    valueProposition:
      'Bombas makes premium everyday socks and apparel, and donates an item for every item sold through its One Purchased = One Donated model.',
    brandTone: 'playful',
    targetCustomer:
      'Mission-aware shoppers who want high-quality everyday essentials and care about social impact.',
    visualStyle:
      'Friendly, honeycomb-inspired motifs, saturated warm secondary colors, clean editorial photography.',
    typographyNotes:
      'Bold, friendly sans for headlines. Tight caps on the wordmark. Small, humanist body.',
    messagingSignals: [
      'One Purchased = One Donated',
      'Better is better',
      'Designed to be the most comfortable',
      'For every item sold, we donate one',
      'Bee better',
    ],
    colorPalette: ['#F4B740', '#1B1B1B', '#FFFFFF', '#E85A4F'],
    recommendedBoxColor: 'white',
    designDirection:
      'Premium-feel white corrugated, black ink only. Big wordmark, short tagline, and the 1=1 mission statement on the back panel. Keep sides clean with only the URL and social handle.',
    industryCategory: 'Apparel',
  },
  'glossier.com': {
    companyName: 'Glossier',
    tagline: 'Skin first. Makeup second.',
    valueProposition:
      'Glossier is a direct-to-consumer beauty brand focused on minimal, skin-forward essentials that celebrate individuality.',
    brandTone: 'clean',
    targetCustomer:
      'Style-conscious Gen Z and millennial beauty consumers who value minimalism and authenticity.',
    visualStyle:
      'Soft pinks, washed pastels, natural-light photography, minimal serif accents, lots of whitespace.',
    typographyNotes:
      'Understated sans for body, distinctive serif for the wordmark. Think editorial, not cosmetic.',
    messagingSignals: [
      'Skin first. Makeup second.',
      'Beauty products inspired by real life',
      'You look good',
      'Milky Jelly',
      'Generation G',
    ],
    colorPalette: ['#FCEBEA', '#1F1F1F', '#FFFFFF', '#D99492'],
    recommendedBoxColor: 'white',
    designDirection:
      'White corrugated, minimal black ink. A delicate serif wordmark dominates the front; tagline small beneath. Side panels carry only the URL. Back panel carries a single line and a small QR.',
    industryCategory: 'Beauty & cosmetics',
  },
  'yeti.com': {
    companyName: 'YETI',
    tagline: 'Built for the wild.',
    valueProposition:
      'YETI makes rugged, high-performance coolers, drinkware, and outdoor gear engineered for extreme conditions.',
    brandTone: 'rugged',
    targetCustomer:
      'Outdoor enthusiasts — anglers, hunters, hikers, overlanders — who want gear that survives the trip.',
    visualStyle:
      'High-contrast, bold, earthy. Weathered textures, hunter greens, iron grays, lots of negative space.',
    typographyNotes:
      'Heavy condensed sans with aggressive caps. Industrial, stencil-adjacent feel.',
    messagingSignals: [
      'Built for the wild',
      'Keeps ice for days',
      'Certified bear-resistant',
      'Overengineered',
      'Rugged gear for the outdoors',
    ],
    colorPalette: ['#1C1C1C', '#5E5248', '#B38449', '#EDE7DC'],
    recommendedBoxColor: 'kraft',
    designDirection:
      'Full kraft surface. Bold, condensed wordmark stamped on the front. Minimal supporting type. A single heavy rule line under the wordmark. Back panel carries a short product-protection line.',
    industryCategory: 'Outdoor gear',
  },
};

function hostFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function titleCase(host: string): string {
  const base = host.split('.')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export function mockBrandAnalysis(url: string, notes?: string): BrandAnalysis {
  const host = hostFromUrl(url);
  const hit = BRAND_FIXTURES[host];
  if (hit) {
    if (notes && notes.trim()) {
      return {
        ...hit,
        designDirection: `${hit.designDirection} User adds: ${notes.trim()}`,
      };
    }
    return hit;
  }
  const name = titleCase(host);
  return {
    companyName: name,
    tagline: `${name} — made on purpose.`,
    valueProposition: `${name} builds practical products for customers who value craft and clarity. The brand positions itself as considered, modern, and honest.`,
    brandTone: 'clean',
    targetCustomer:
      'Design-aware consumers who appreciate thoughtful products and straightforward brands.',
    visualStyle:
      'Clean layouts, confident typography, lots of whitespace, and warm neutral accents.',
    typographyNotes:
      'A confident display serif paired with a precise modern sans would suit the brand on pack.',
    messagingSignals: [
      'Made on purpose',
      'Quality by default',
      'Built to last',
      'Made for you',
    ],
    colorPalette: ['#1A1A1A', '#F5F3EF', '#C4A265'],
    recommendedBoxColor: 'kraft',
    designDirection:
      'Use the kraft substrate. One confident wordmark on the front, a single supporting line, and plenty of breathing room. Side panels carry the URL only. Back panel carries a short promise.',
    industryCategory: 'General retail',
  };
}

/* -----------------------------  BOX RECOMMENDATION  ---------------------------- */

export function mockBoxRecommendation(
  answers: SizingAnswers,
  brand: BrandAnalysis,
): BoxRecommendation {
  const weightHeavy = answers.productWeight === 'over30';
  const ectRating: '32 ECT' | 'Heavy Duty' = weightHeavy ? 'Heavy Duty' : '32 ECT';

  const brandColorCue = brand.recommendedBoxColor;
  const industry = (brand.industryCategory || '').toLowerCase();
  const needsWhite =
    industry.includes('beauty') ||
    industry.includes('cosmetic') ||
    industry.includes('food') ||
    industry.includes('medical') ||
    industry.includes('pharma');
  const boxColor: 'kraft' | 'white' = needsWhite ? 'white' : brandColorCue;

  // Parse any LxWxH from dimensions field
  const dimMatch = answers.productDimensions.match(
    /(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)/i,
  );
  const productVol = dimMatch
    ? parseFloat(dimMatch[1]) * parseFloat(dimMatch[2]) * parseFloat(dimMatch[3])
    : null;

  // Padding based on fit preference
  const pad =
    answers.fitPreference === 'protective'
      ? 2.5
      : answers.fitPreference === 'tight'
        ? 0.5
        : 1.5;

  // Pick a box by closest volume with required padding
  let primary: BoxSize = BOX_CATALOG[2]; // default 10x8x6
  if (dimMatch) {
    const [, lS, wS, hS] = dimMatch;
    const targetL = parseFloat(lS) + pad;
    const targetW = parseFloat(wS) + pad;
    const targetH = parseFloat(hS) + pad;
    const scored = BOX_CATALOG.map((b) => {
      const fits = b.length >= targetL && b.width >= targetW && b.height >= targetH;
      const vol = b.length * b.width * b.height;
      return { b, fits, excess: vol - (productVol ?? 0) };
    })
      .filter((s) => s.fits)
      .sort((a, b) => a.excess - b.excess);
    if (scored.length) primary = scored[0].b;
  } else {
    // Choose by weight bucket heuristic
    if (answers.productWeight === 'under5') {
      primary = BOX_CATALOG.find((b) => b.id === 'pop-1') || primary;
    } else if (answers.productWeight === '5to15') {
      primary = BOX_CATALOG.find((b) => b.id === 'std-3') || primary;
    } else if (answers.productWeight === '15to30') {
      primary = BOX_CATALOG.find((b) => b.id === 'pop-3') || primary;
    } else if (answers.productWeight === 'over30') {
      primary = BOX_CATALOG.find((b) => b.id === 'pop-4') || primary;
    }
  }

  // Alternate = next-larger box in catalog
  const idx = BOX_CATALOG.findIndex((b) => b.id === primary.id);
  const alternate = BOX_CATALOG[idx + 1] || BOX_CATALOG[idx];

  const fragile = answers.fragility === 'high';
  const rationale = [
    `For "${answers.productDescription || 'your product'}" at ${
      {
        under5: 'under 5 lb',
        '5to15': '5–15 lb',
        '15to30': '15–30 lb',
        over30: 'over 30 lb',
      }[answers.productWeight]
    } with ${fragile ? 'fragile handling needs' : 'standard durability'}, `,
    `${primary.name} gives a ${answers.fitPreference} fit with enough room for ${
      answers.needsInserts ? 'inserts and void fill' : 'basic protection'
    }.`,
    ` We picked the smallest catalog size that comfortably contains the product to minimize dim-weight cost.`,
  ].join('');

  const confidence: 'high' | 'medium' | 'low' = dimMatch
    ? 'high'
    : answers.productDescription.trim().length > 15
      ? 'medium'
      : 'low';

  return {
    primaryBox: primary,
    alternateBox: alternate,
    confidence,
    rationale,
    ectRating,
    boxColor,
  };
}

/* -----------------------------  DESIGN GENERATION  ---------------------------- */

export function mockDesign(opts: {
  brand: BrandAnalysis;
  box: BoxSize;
  boxColor: 'kraft' | 'white';
  hasLogo: boolean;
}): DesignLayout {
  const { brand, boxColor, hasLogo } = opts;
  const nameUpper = brand.companyName.toUpperCase();
  const tagline = brand.tagline || 'Made on purpose.';
  const host = hostFromUrl('https://example.com'); // placeholder, real URL plumbed separately
  void host;
  const urlLine = brand.companyName.toLowerCase().replace(/\s+/g, '') + '.com';
  const trustLine =
    brand.messagingSignals && brand.messagingSignals.length > 0
      ? brand.messagingSignals[0]
      : 'Built to last';

  const front: PanelDesign = {
    panel: 'front',
    elements: [
      hasLogo
        ? {
            type: 'logo',
            x: 50,
            y: 28,
            width: 46,
            height: 22,
          }
        : null,
      {
        type: 'text',
        content: nameUpper,
        x: 50,
        y: hasLogo ? 52 : 44,
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 4,
      },
      {
        type: 'line',
        x: 50,
        y: hasLogo ? 60 : 52,
        width: 40,
        height: 0,
      },
      {
        type: 'text',
        content: tagline,
        x: 50,
        y: hasLogo ? 68 : 60,
        fontSize: 12,
        fontWeight: 'light',
        textAlign: 'center',
        letterSpacing: 2,
      },
    ].filter(Boolean) as PanelDesign['elements'],
  };

  const back: PanelDesign = {
    panel: 'back',
    elements: [
      {
        type: 'text',
        content: nameUpper,
        x: 50,
        y: 20,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        letterSpacing: 3,
      },
      {
        type: 'line',
        x: 50,
        y: 28,
        width: 20,
        height: 0,
      },
      {
        type: 'text',
        content: trustLine.toUpperCase(),
        x: 50,
        y: 45,
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'center',
        letterSpacing: 1.5,
      },
      {
        type: 'qr-placeholder',
        x: 50,
        y: 70,
        width: 20,
        height: 28,
      },
      {
        type: 'text',
        content: urlLine,
        x: 50,
        y: 92,
        fontSize: 9,
        fontWeight: 'normal',
        textAlign: 'center',
        letterSpacing: 1,
      },
    ],
  };

  const top: PanelDesign = {
    panel: 'top',
    elements: [
      hasLogo
        ? {
            type: 'logo',
            x: 50,
            y: 50,
            width: 30,
            height: 60,
          }
        : {
            type: 'text',
            content: nameUpper,
            x: 50,
            y: 50,
            fontSize: 22,
            fontWeight: 'bold',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: 3,
          },
      {
        type: 'text',
        content: 'HANDLE WITH CARE',
        x: 50,
        y: 88,
        fontSize: 8,
        fontWeight: 'normal',
        textAlign: 'center',
        letterSpacing: 2,
      },
    ],
  };

  const bottom: PanelDesign = {
    panel: 'bottom',
    elements: [
      {
        type: 'text',
        content: 'PRINTED ON RECYCLED MATERIAL',
        x: 50,
        y: 50,
        fontSize: 9,
        fontWeight: 'light',
        textAlign: 'center',
        letterSpacing: 2,
      },
    ],
  };

  const left: PanelDesign = {
    panel: 'left',
    elements: [
      {
        type: 'text',
        content: urlLine,
        x: 50,
        y: 50,
        fontSize: 11,
        fontWeight: 'normal',
        textAlign: 'center',
        letterSpacing: 2,
      },
    ],
  };

  const right: PanelDesign = {
    panel: 'right',
    elements: [
      {
        type: 'text',
        content: tagline.toUpperCase(),
        x: 50,
        y: 50,
        fontSize: 11,
        fontWeight: 'light',
        textAlign: 'center',
        letterSpacing: 2,
      },
    ],
  };

  return {
    panels: [front, back, top, bottom, left, right],
    designNotes: `Simulated initial layout for ${brand.companyName}. Front carries the wordmark + tagline with a thin rule line. Back has the company mark, a trust line from the brand messaging, and a QR + URL block. Side panels stay minimal. All elements are black ink only on ${boxColor} corrugated.`,
    inkColor: 'black',
    boxColor,
  };
}

/* -----------------------------  DESIGN REFINEMENT  ---------------------------- */

function cloneLayout(d: DesignLayout): DesignLayout {
  return JSON.parse(JSON.stringify(d)) as DesignLayout;
}

export function mockRefineDesign(
  current: DesignLayout,
  userPrompt: string,
): DesignLayout {
  const p = userPrompt.toLowerCase();
  const next = cloneLayout(current);
  const notes: string[] = [];

  const scaleLogos = (factor: number) => {
    for (const panel of next.panels) {
      for (const el of panel.elements) {
        if (el.type === 'logo') {
          if (el.width) el.width = Math.max(10, Math.min(95, el.width * factor));
          if (el.height) el.height = Math.max(10, Math.min(95, el.height * factor));
        }
      }
    }
  };

  const findPanel = (key: string) =>
    next.panels.find((pd) => pd.panel === key);

  if (/\blogo\b.*\b(larger|bigger|scale up|huge)\b|make.*(logo|mark).*(big|large)/.test(p)) {
    scaleLogos(1.3);
    notes.push('scaled logos up ~30%');
  }
  if (/\blogo\b.*\b(smaller|tiny|shrink)\b|reduce.*logo/.test(p)) {
    scaleLogos(0.75);
    notes.push('shrank logos ~25%');
  }
  if (/simplify|less clutter|reduce clutter|minimal|declutter/.test(p)) {
    for (const panel of next.panels) {
      if (panel.panel === 'left' || panel.panel === 'right' || panel.panel === 'bottom') {
        panel.elements = panel.elements.slice(0, 1);
      } else {
        panel.elements = panel.elements.slice(0, 3);
      }
    }
    notes.push('trimmed side & bottom panels to essentials');
  }
  if (/premium|elegant|luxury|refined/.test(p)) {
    for (const panel of next.panels) {
      for (const el of panel.elements) {
        if (el.type === 'text' && el.fontWeight !== 'light') {
          el.textTransform = 'uppercase';
          el.letterSpacing = Math.max(el.letterSpacing || 1, 3);
        }
      }
    }
    notes.push('tightened hierarchy, pushed spacing for a more premium feel');
  }
  if (/playful|fun|whimsical/.test(p)) {
    for (const panel of next.panels) {
      for (const el of panel.elements) {
        if (el.type === 'text' && el.fontWeight === 'light') {
          el.fontStyle = 'italic';
        }
      }
    }
    notes.push('italicized supporting type to feel more playful');
  }
  if (/sustainab|recycled|eco|green/.test(p)) {
    const back = findPanel('back');
    if (back) {
      back.elements.push({
        type: 'text',
        content: 'PRINTED ON 100% RECYCLED FIBER — PLEASE REUSE OR RECYCLE',
        x: 50,
        y: 84,
        fontSize: 8,
        fontWeight: 'normal',
        textAlign: 'center',
        letterSpacing: 1.5,
      });
    }
    notes.push('added sustainability line to back panel');
  }
  if (/trust|value prop|value-prop|badge|review/.test(p)) {
    const front = findPanel('front');
    if (front) {
      front.elements.push({
        type: 'text',
        content: '★ ★ ★ ★ ★   OVER 1M HAPPY CUSTOMERS',
        x: 50,
        y: 86,
        fontSize: 9,
        fontWeight: 'normal',
        textAlign: 'center',
        letterSpacing: 2,
      });
    }
    notes.push('added a trust signal to front');
  }
  if (/\bqr\b|qr code|qr-code/.test(p) && !findPanel('back')?.elements.some((e) => e.type === 'qr-placeholder')) {
    const back = findPanel('back');
    if (back) {
      back.elements.push({
        type: 'qr-placeholder',
        x: 50,
        y: 70,
        width: 22,
        height: 30,
      });
    }
    notes.push('added QR placeholder on back panel');
  }
  if (/barcode/.test(p)) {
    const bottom = findPanel('bottom');
    if (bottom) {
      bottom.elements.push({
        type: 'barcode-placeholder',
        x: 50,
        y: 70,
        width: 36,
        height: 12,
      });
    }
    notes.push('added barcode placeholder to bottom');
  }
  if (/move tagline.*top|tagline.*top panel/.test(p)) {
    const front = findPanel('front');
    const top = findPanel('top');
    if (front && top) {
      const taglineIdx = front.elements.findIndex(
        (e) =>
          e.type === 'text' &&
          e.fontWeight === 'light' &&
          (e.fontSize || 0) <= 14,
      );
      if (taglineIdx >= 0) {
        const [moved] = front.elements.splice(taglineIdx, 1);
        top.elements.push({
          ...moved,
          x: 50,
          y: 88,
          fontSize: 8,
          letterSpacing: 2,
        });
      }
    }
    notes.push('moved tagline to top panel');
  }
  if (/handle with care|fragile/.test(p)) {
    const top = findPanel('top');
    if (top && !top.elements.some((e) => e.type === 'text' && (e.content || '').toUpperCase().includes('HANDLE'))) {
      top.elements.push({
        type: 'text',
        content: 'HANDLE WITH CARE',
        x: 50,
        y: 90,
        fontSize: 8,
        fontWeight: 'bold',
        textAlign: 'center',
        letterSpacing: 3,
      });
    }
    notes.push('added HANDLE WITH CARE on top');
  }
  if (/reduce.*side|clutter.*side|simplify.*side/.test(p)) {
    const left = findPanel('left');
    const right = findPanel('right');
    for (const panel of [left, right]) {
      if (panel) panel.elements = panel.elements.slice(0, 1);
    }
    notes.push('stripped side panels to one element each');
  }

  if (notes.length === 0) {
    notes.push(`applied your request: "${userPrompt}"`);
    // Subtle transform: shift all text up a touch so something visibly changes
    for (const panel of next.panels) {
      for (const el of panel.elements) {
        if (el.type === 'text') {
          el.y = Math.max(6, Math.min(94, el.y - 1));
        }
      }
    }
  }

  next.designNotes = `Refinement applied — ${notes.join('; ')}. Black ink, panel logic preserved.`;
  return next;
}

/* -----------------------------  CHAT  ---------------------------- */

export function mockChatReply(userText: string): string {
  const p = userText.toLowerCase();
  if (/roi|break[- ]even|payback/.test(p)) {
    return 'Custom branded boxes typically pay for themselves in 2–6 months for brands shipping 500+ boxes per month, once you factor in the higher perceived value, reduced brand-materials spend (stickers, tape, inserts), and the increase in repeat-purchase rates. Use our full calculator here: https://customboxes.io/pages/custom-shipping-boxes-roi-breakeven-comp-shop-calculators';
  }
  if (/\bect\b|heavy duty|strength|stacking/.test(p)) {
    return '32 ECT (Edge Crush Test) is our standard single-wall corrugated — rated for products under 30 lb and comfortable for most e-commerce shipping. Heavy Duty uses double-wall board and is appropriate for anything 30+ lb, fragile equipment, or long-haul freight where the box may see rough handling.';
  }
  if (/kraft|white|color|material/.test(p)) {
    return 'Kraft fits rugged, outdoor, eco, and artisan brands — the substrate itself communicates "natural". White fits premium, clean, medical, food, and cosmetics — the substrate reads as deliberate and contemporary. Both accept black ink equally well.';
  }
  if (/side panel|left panel|right panel/.test(p)) {
    return "Side panels see the least eye time in a warehouse, so keep them minimal. The best uses are: the website URL, a short social handle, or a single value-prop line. Avoid loading side panels with long copy or competing hierarchy — white space reads expensive.";
  }
  if (/fragile|inserts|void fill/.test(p)) {
    return 'For fragile items, size up one catalog box so you have room for inserts or void fill (bubble, paper honeycomb, foam corners). 1–2 inches of cushioning on each side is typical. Pair this with a "HANDLE WITH CARE" stamp on the top panel.';
  }
  if (/premium|minimal|elegant|luxury/.test(p)) {
    return 'Premium on corrugated is about restraint, not decoration. One confident wordmark, one supporting line, a single thin rule. Use uppercase with wide letter-spacing (3–4px), and leave aggressive whitespace. If the brand is truly premium, a subtle deboss would help — but for black-ink-only prints, restraint is the whole strategy.';
  }
  if (/quote|pricing|5000|large order/.test(p)) {
    return 'For volumes over 5,000 boxes / month you qualify for custom pricing — request a quote here: https://customboxes.io/pages/large-order-quote-request-form . Below that, the volume tiers on the site are competitive out of the box.';
  }
  return 'Happy to help. Ask me about brand tone, side-panel strategy, kraft vs white, ECT ratings, inserts, ROI numbers, or how to adjust the current design. I can also walk you through what our CustomBoxes.io workflow typically looks like for a small brand just getting started.';
}

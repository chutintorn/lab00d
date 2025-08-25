// src/utils/pricingConstants.js
// Single source of truth for seat pricing, privacy fees, markup, and refunds.

export const ZONE_PRICE_THB = Object.freeze({
  frontPremium: 500,
  premium: 350,
  happy: 150,
});

// Privacy fee paid by the owner when marking adjacent seats as privacy (THB)
export const PRIVACY_FEE_PER_ZONE_THB = Object.freeze({
  frontPremium: 200,
  premium: 150,
  happy: 100,
});

// FIXED markup (THB) shown to other passengers if a seat is someone else’s privacy seat
// (you asked for: frontPremium +100, premium +70, happy +50)
export const MARKUP_PER_ZONE_THB = Object.freeze({
  frontPremium: 100,
  premium: 70,
  happy: 50,
});

// share of markup that is refunded to the privacy owner when their privacy seat is sold
// business rule: FP gets 50% of the markup, premium/happy get 100%
export const TOPUP_SHARE_PER_ZONE = Object.freeze({
  frontPremium: 0.5,
  premium: 1.0,
  happy: 1.0,
});

export const CURRENCY = "THB";

// ----- Helpers -----

export const priceWithFixedMarkup = (baseTHB, zone) =>
  Math.max(0, Number(baseTHB || 0)) + Math.max(0, Number(MARKUP_PER_ZONE_THB[zone] || 0));

export function computePrivacyRefundTHB(zone) {
  const fee = Number(PRIVACY_FEE_PER_ZONE_THB[zone] || 0);
  const markup = Number(MARKUP_PER_ZONE_THB[zone] || 0);
  const share = Number(TOPUP_SHARE_PER_ZONE[zone] || 0);
  return fee + Math.round(markup * share);
}

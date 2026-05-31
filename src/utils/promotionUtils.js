function itemMatchesScope(item, promotion) {
  const scope = promotion.scope;
  if (scope === 'store_wide') return true;
  const scopeValue = promotion.scopeValue || promotion.scope_value || '';
  if (scope === 'category') {
    return (item.category || '').toLowerCase() === scopeValue.toLowerCase();
  }
  if (scope === 'item') {
    return (
      String(item.id) === String(scopeValue) ||
      (item.name || '').toLowerCase() === scopeValue.toLowerCase()
    );
  }
  return false;
}

function applyPercentagePromotion(cartItems, promotion) {
  const pct = promotion.discountPercent ?? promotion.discount_percent ?? 0;
  if (pct <= 0) return cartItems;
  return cartItems.map((item) => {
    if (!itemMatchesScope(item, promotion)) return item;
    const originalPrice = item.originalPrice ?? item.discountedPrice ?? (item.sellPrice ?? item.price ?? 0);
    const originalPriceNum = typeof originalPrice === 'string'
      ? parseFloat(originalPrice.replace(/[^0-9.-]/g, '')) || 0
      : Number(originalPrice) || 0;
    const discountedPrice = Math.round(originalPriceNum * (1 - pct / 100) * 100) / 100;
    return {
      ...item,
      originalPrice: item.originalPrice ?? originalPriceNum,
      discountedPrice,
      discountApplied: true,
    };
  });
}

function applyBxgyPromotion(cartItems, promotion) {
  const buyQty = promotion.buyQuantity ?? promotion.buy_quantity ?? 0;
  const getQty = promotion.getQuantity ?? promotion.get_quantity ?? 0;
  if (buyQty <= 0 || getQty <= 0) return cartItems;

  const matchingIndices = [];
  cartItems.forEach((item, idx) => {
    if (itemMatchesScope(item, promotion)) {
      for (let q = 0; q < item.quantity; q++) {
        matchingIndices.push(idx);
      }
    }
  });

  const groupSize = buyQty + getQty;
  const freeUnitsByIndex = new Map();
  let pos = 0;
  while (pos + groupSize <= matchingIndices.length) {
    for (let f = 0; f < getQty; f++) {
      const freeIdx = matchingIndices[pos + buyQty + f];
      freeUnitsByIndex.set(freeIdx, (freeUnitsByIndex.get(freeIdx) || 0) + 1);
    }
    pos += groupSize;
  }

  if (freeUnitsByIndex.size === 0) return cartItems;

  return cartItems.map((item, idx) => {
    const freeUnits = freeUnitsByIndex.get(idx) || 0;
    if (freeUnits === 0) return item;
    const originalPriceNum = (() => {
      const raw = item.originalPrice ?? item.discountedPrice ?? (item.sellPrice ?? item.price ?? 0);
      return typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.-]/g, '')) || 0 : Number(raw) || 0;
    })();
    const paidUnits = item.quantity - freeUnits;
    const lineTotal = Math.round(originalPriceNum * paidUnits * 100) / 100;
    return {
      ...item,
      originalPrice: item.originalPrice ?? originalPriceNum,
      bxgyFreeUnits: freeUnits,
      lineTotal,
      discountApplied: true,
    };
  });
}

export function applyPromotions(cartItems, promotions) {
  if (!Array.isArray(promotions) || promotions.length === 0) return cartItems;
  if (!Array.isArray(cartItems) || cartItems.length === 0) return cartItems;

  let result = cartItems;
  for (const promotion of promotions) {
    if (promotion.type === 'percentage') {
      result = applyPercentagePromotion(result, promotion);
    } else if (promotion.type === 'bxgy') {
      result = applyBxgyPromotion(result, promotion);
    }
  }
  return result;
}

export function promotionChipLabel(promotion) {
  if (promotion.type === 'percentage') {
    const pct = promotion.discountPercent ?? promotion.discount_percent ?? 0;
    return `${promotion.name} — ${pct}% off`;
  }
  if (promotion.type === 'bxgy') {
    const b = promotion.buyQuantity ?? promotion.buy_quantity ?? '?';
    const g = promotion.getQuantity ?? promotion.get_quantity ?? '?';
    return `${promotion.name} — Buy ${b} Get ${g} Free`;
  }
  return promotion.name;
}

export function calculateSavings(originalItems, discountedItems) {
  let savings = 0;
  originalItems.forEach((orig, idx) => {
    const disc = discountedItems[idx];
    if (!disc) return;
    const origPrice = (() => {
      const raw = orig.sellPrice ?? orig.price ?? 0;
      return typeof raw === 'string' ? parseFloat(raw.replace(/[^0-9.-]/g, '')) || 0 : Number(raw) || 0;
    })();
    const origTotal = origPrice * orig.quantity;
    let discTotal;
    if (disc.lineTotal != null) {
      discTotal = disc.lineTotal;
    } else {
      const dPrice = disc.discountedPrice ?? origPrice;
      discTotal = dPrice * disc.quantity;
    }
    savings += origTotal - discTotal;
  });
  return Math.round(savings * 100) / 100;
}

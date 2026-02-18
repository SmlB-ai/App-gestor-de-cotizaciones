/**
 * Calculation utilities for material estimation.
 */

export interface AreaCalculation {
  width: number;
  length: number;
  yieldPerUnit: number;
}

/**
 * Calculates the number of units needed for a given area and yield.
 * @param params {AreaCalculation}
 * @returns number of units (rounded up)
 */
export function calculateRequiredUnits({ width, length, yieldPerUnit }: AreaCalculation): number {
  if (yieldPerUnit <= 0) return 0;
  const area = width * length;
  return Math.ceil(area / yieldPerUnit);
}

/**
 * Formats a number as currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

/**
 * Calculates totals including IVA and discounts.
 */
export function calculateJobTotals(
  subtotal: number,
  ivaEnabled: boolean,
  ivaPercent: number,
  discountEnabled: boolean,
  discountPercent: number
) {
  let discountAmount = 0;
  if (discountEnabled) {
    discountAmount = subtotal * (discountPercent / 100);
  }

  const subtotalAfterDiscount = subtotal - discountAmount;

  let ivaAmount = 0;
  if (ivaEnabled) {
    ivaAmount = subtotalAfterDiscount * (ivaPercent / 100);
  }

  const total = subtotalAfterDiscount + ivaAmount;

  return {
    subtotal,
    discountAmount,
    subtotalAfterDiscount,
    ivaAmount,
    total
  };
}

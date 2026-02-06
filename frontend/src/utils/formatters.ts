export function formatCurrency(val: string | null | undefined, currency = 'USD'): string {
  const num = parseFloat(val || '0');
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num);
}

export function formatNumber(val: string | null | undefined): string {
  const num = parseInt(val || '0', 10);
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(val: string | null | undefined): string {
  return `${parseFloat(val || '0').toFixed(2)}%`;
}

export function formatDecimal(val: string | null | undefined, currency = 'USD'): string {
  const num = parseFloat(val || '0');
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
}

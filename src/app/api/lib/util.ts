export type Currency = string;

export function addDelta(m: Map<string, Map<Currency, number>>, personId: string, currency: Currency, delta: number): void {
  if (!personId || !currency) return;
  if (Math.abs(delta) < 1e-12) return;

  if (!m.has(personId)) {
    m.set(personId, new Map<Currency, number>());
  }
  const currencyMap = m.get(personId)!;
  const currentBalance = currencyMap.get(currency) || 0;
  currencyMap.set(currency, currentBalance + delta);
}

export function flattenDelta(m: Map<string, Map<Currency, number>>) {
  const delta_flat: { person_id: string; currency: Currency; balance: number }[] = [];
  for (const [personId, currencyMap] of m.entries()) {
    for (const [currency, balance] of currencyMap.entries()) {
      delta_flat.push({ person_id: personId, currency: currency, balance: balance });
    }
  }
  return delta_flat;
}
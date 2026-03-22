const BALANCE_KEY = "royal_casino_balance";
export const STARTING_BALANCE = 1000;

export function loadBalance(): number {
  if (typeof window === "undefined") return STARTING_BALANCE;
  const stored = localStorage.getItem(BALANCE_KEY);
  return stored !== null ? parseFloat(stored) : STARTING_BALANCE;
}

export function saveBalance(amount: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BALANCE_KEY, String(amount));
}

export function resetBalance(): void {
  saveBalance(STARTING_BALANCE);
}

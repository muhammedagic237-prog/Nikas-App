export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-BA", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

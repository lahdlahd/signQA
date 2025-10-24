const rtf = new Intl.RelativeTimeFormat("en", {
  numeric: "auto"
});

const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
  ["second", 1000]
];

export function formatRelative(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  const diff = value.getTime() - Date.now();

  for (const [unit, unitMs] of units) {
    if (Math.abs(diff) >= unitMs || unit === "second") {
      const amount = Math.round(diff / unitMs);
      return rtf.format(amount, unit);
    }
  }

  return "just now";
}

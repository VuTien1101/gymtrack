export function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidVietnamesePhone(value: unknown): value is string {
  return typeof value === "string" && /^0\d{9,10}$/.test(value);
}

export function parseDateOfBirth(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value)
    return null;
  return date.getTime() <= Date.now() ? date : null;
}

export function isValidPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 6;
}

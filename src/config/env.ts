/**
 * Reads an environment variable as a positive integer, returning defaultValue when it is unset
 * or empty and throwing at startup for anything else, so a typo fails before the service runs.
 */
export function getPositiveIntEnv(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return defaultValue;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got '${raw}'`);
  }
  return value;
}

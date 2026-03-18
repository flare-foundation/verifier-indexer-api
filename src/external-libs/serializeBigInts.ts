export function serializeBigInts<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_key, value: unknown) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  ) as T;
}

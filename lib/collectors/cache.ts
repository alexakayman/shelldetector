export interface CacheOptions<K, T> {
  revalidate: (key: K) => Promise<T>;
  get: (key: K) => Promise<T | null>;
  set: (key: K, value: T) => Promise<void>;
}

export function createCache<K, T>(options: CacheOptions<K, T>) {
  return async (key: K) => {
    const existing = await options.get(key);

    if (existing) {
      return existing;
    }

    const next = await options.revalidate(key);

    await options.set(key, next);

    return next;
  };
}

export function cache<K, V>({
  key,
  ...options
}: CacheOptions<K, V> & { key: K }) {
  return createCache(options)(key);
}

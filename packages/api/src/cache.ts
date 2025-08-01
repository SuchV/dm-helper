export class MemoryCache<T> {
  private _cache: Map<string, { expires: number; data: T }>;
  private _defaultTTL: number;
  private _clearnupInterval: NodeJS.Timeout | null = null;

  constructor();
  constructor(ttl: number);

  constructor(ttl?: number) {
    console.log(
      "Initializing MemoryCache with TTL:",
      ttl ?? "default (5 seconds)",
    );
    this._cache = new Map<string, any>();
    this._defaultTTL = ttl ?? 1000 * 5; // Default TTL is 5 seconds
    this._clearnupInterval = setInterval(
      () => {
        const now = Date.now();
        for (const [key, value] of this._cache.entries()) {
          if (value.expires <= now) {
            this._cache.delete(key); // Remove expired cache
          }
        }
      },
      60 * 60 * 1000,
    ); // Cleanup every hour
  }

  get(key: string): T | undefined {
    const cached = this._cache.get(key);
    if (cached) {
      if (cached.expires > Date.now()) {
        return cached.data;
      } else {
        this._cache.delete(key); // Remove expired cache
      }
    }
    return undefined;
  }

  set(key: string, data: T, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this._defaultTTL);
    this._cache.set(key, { expires, data });
  }
}

export class TwoLevelMemoryCache<T> extends MemoryCache<T> {
  getElem(key1: string, key2: string): T | undefined {
    const fullKey = `${key1}:${key2}`;
    return super.get(fullKey);
  }
  setElem(key1: string, key2: string, data: T, ttl?: number): void {
    const fullKey = `${key1}:${key2}`;
    super.set(fullKey, data, ttl);
  }
}

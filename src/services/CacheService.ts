interface CacheItem<T> {
  value: T
  timestamp: number
}

export class CacheService {
  private static instance: CacheService
  private cache: Map<string, CacheItem<any>>
  private readonly DEFAULT_TTL = 1000 * 60 * 60 // 1 hour

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService()
    }
    return CacheService.instance
  }

  set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now() + ttl,
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    if (Date.now() > item.timestamp) {
      this.cache.delete(key)
      return null
    }

    return item.value as T
  }

  getAll<T>(prefix: string): T[] {
    const items: T[] = [];
    for (const [key, item] of this.cache.entries()) {
      if (key.startsWith(prefix)) {
        if (Date.now() > item.timestamp) {
          this.cache.delete(key);
        } else {
          items.push(item.value as T);
        }
      }
    }
    return items;
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false

    if (Date.now() > item.timestamp) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Helper method to generate cache keys for Gemini API calls
  static generateGeminiKey(method: string, params: any[]): string {
    return `gemini:${method}:${JSON.stringify(params)}`
  }
}

export const cacheService = CacheService.getInstance()

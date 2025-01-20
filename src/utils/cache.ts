interface CacheItem<T> {
    data: T;
    timestamp: number;
  }
  
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds
  
  export const getCachedData = <T>(key: string): T | null => {
    const cached = localStorage.getItem(key);
    if (!cached) {
      console.log(`Cache miss (localStorage): ${key}`);
      return null;
    }
  
    const item: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();
  
    if (now - item.timestamp > CACHE_DURATION) {
      console.log(`Cache expired (localStorage): ${key}`);
      localStorage.removeItem(key);
      return null;
    }
  
    console.log(`Cache hit (localStorage): ${key}`);
    return item.data;
  };
  
  export const setCachedData = <T>(key: string, data: T): void => {
    console.log(`Caching data (localStorage): ${key}`);
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  };
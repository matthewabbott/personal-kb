// src/utils/cache.ts
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
    const age = now - item.timestamp;
    const expires = new Date(item.timestamp + CACHE_DURATION);
  
    if (age > CACHE_DURATION) {
      console.log(`Cache expired (localStorage): ${key}`);
      console.log(`Created: ${new Date(item.timestamp).toISOString()}`);
      console.log(`Expired: ${expires.toISOString()}`);
      localStorage.removeItem(key);
      return null;
    }
  
    console.log(`Cache hit (localStorage): ${key}`);
    console.log(`Created: ${new Date(item.timestamp).toISOString()}`);
    console.log(`Expires: ${expires.toISOString()}`);
    console.log(`Age: ${Math.round(age / 1000)}s`);
    
    return item.data;
  };
  
  export const setCachedData = <T>(key: string, data: T): void => {
    const timestamp = Date.now();
    const expires = new Date(timestamp + CACHE_DURATION);
    
    console.log(`Caching data (localStorage): ${key}`);
    console.log(`Created: ${new Date(timestamp).toISOString()}`);
    console.log(`Expires: ${expires.toISOString()}`);
    
    const item: CacheItem<T> = {
      data,
      timestamp,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };
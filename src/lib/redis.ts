import Redis from "ioredis";

// Cache configuration constants
export const CACHE_TTL = {
  RESUME_DOCUMENT: 60 * 60, // 1 hour
  RESUME_CONFIG: 60 * 30,   // 30 minutes
  PORTFOLIO_LIST: 60 * 15,  // 15 minutes
  RATE_LIMIT_WINDOW: 60 * 10, // 10 minutes
};

// Global singleton to prevent connection leaks across Next.js hot reloads in dev
const globalForRedis = globalThis as unknown as {
  redisClient: Redis | null;
  redisAvailable: boolean;
};

function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL;

  // If no REDIS_URL is provided, operate in cache-disabled fallback mode
  if (!redisUrl) {
    return null;
  }

  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      enableOfflineQueue: false, // Don't block requests if Redis is unreachable
      retryStrategy(times) {
        if (times > 3) {
          // Stop hammering Redis if it's down
          return null;
        }
        return Math.min(times * 100, 1000);
      },
    });

    client.on("error", (err) => {
      // Suppress repeated connection noise in console, degrade gracefully
      if (globalForRedis.redisAvailable !== false) {
        console.warn(`[Redis] Connection warning: ${err.message}. Gracefully falling back to database.`);
        globalForRedis.redisAvailable = false;
      }
    });

    client.on("connect", () => {
      globalForRedis.redisAvailable = true;
      console.log("[Redis] Connected successfully to in-memory cache.");
    });

    return client;
  } catch (error) {
    console.warn("[Redis] Failed to initialize client, proceeding in DB-only mode:", error);
    return null;
  }
}

export const redis = globalForRedis.redisClient ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redisClient = redis;
}

/**
 * Retrieve cached JSON data from Redis. Returns null on cache miss or Redis error.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;

  try {
    // If not connected yet, lazy connect
    if (redis.status === "wait") {
      await redis.connect().catch(() => null);
    }
    if (redis.status !== "ready" && redis.status !== "connecting") {
      return null;
    }

    const data = await redis.get(key);
    if (!data) return null;

    return JSON.parse(data) as T;
  } catch {
    // Graceful fallback to database
    return null;
  }
}

/**
 * Store data as JSON in Redis with an optional TTL (in seconds).
 */
export async function setCache(
  key: string,
  data: unknown,
  ttlSeconds: number = CACHE_TTL.RESUME_DOCUMENT
): Promise<void> {
  if (!redis) return;

  try {
    if (redis.status === "wait") {
      await redis.connect().catch(() => null);
    }
    if (redis.status !== "ready" && redis.status !== "connecting") {
      return;
    }

    const serialized = JSON.stringify(data);
    await redis.set(key, serialized, "EX", ttlSeconds);
  } catch {
    // Graceful degradation - silently proceed
  }
}

/**
 * Invalidate a specific cache key or scan for matching keys.
 */
export async function invalidateCache(patternOrKey: string): Promise<void> {
  if (!redis) return;

  try {
    if (redis.status === "wait") {
      await redis.connect().catch(() => null);
    }
    if (redis.status !== "ready" && redis.status !== "connecting") {
      return;
    }

    if (patternOrKey.includes("*")) {
      const keys = await redis.keys(patternOrKey);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } else {
      await redis.del(patternOrKey);
    }
  } catch {
    // Graceful degradation
  }
}

/**
 * Flush all resume, overview, variants, and matrix caches
 */
export async function invalidateAllResumeCaches(): Promise<void> {
  await Promise.all([
    invalidateCache("resume_*"),
    invalidateCache("overview:*"),
    invalidateCache("matrix_data:*"),
    invalidateCache("variants:*"),
  ]);
}

/**
 * Atomic sliding rate limiter using Redis INCR & EXPIRE.
 * Useful for brute-force prevention on authentication / APIs.
 */
export async function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowSeconds: number = CACHE_TTL.RATE_LIMIT_WINDOW
): Promise<{ allowed: boolean; remaining: number; resetSeconds: number }> {
  if (!redis) {
    // If Redis is not running, allow the request by default
    return { allowed: true, remaining: maxAttempts, resetSeconds: 0 };
  }

  try {
    if (redis.status === "wait") {
      await redis.connect().catch(() => null);
    }
    if (redis.status !== "ready" && redis.status !== "connecting") {
      return { allowed: true, remaining: maxAttempts, resetSeconds: 0 };
    }

    const currentCount = await redis.incr(key);

    if (currentCount === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);

    return {
      allowed: currentCount <= maxAttempts,
      remaining: Math.max(0, maxAttempts - currentCount),
      resetSeconds: Math.max(0, ttl),
    };
  } catch {
    // If Redis check fails, fail open to avoid locking legitimate users out
    return { allowed: true, remaining: maxAttempts, resetSeconds: 0 };
  }
}

import Redis from 'ioredis';

class InMemoryRedisFallback {
  constructor() {
    this.store = new Map();
    this.expirations = new Map();
    console.log('[Redis] Running in robust In-Memory Redis Mock mode (caching carts & sessions).');
  }

  _isExpired(key) {
    if (this.expirations.has(key)) {
      const expiry = this.expirations.get(key);
      if (Date.now() > expiry) {
        this.store.delete(key);
        this.expirations.delete(key);
        return true;
      }
    }
    return false;
  }

  async get(key) {
    if (this._isExpired(key)) return null;
    const val = this.store.get(key);
    return val !== undefined ? val : null;
  }

  async set(key, value, ...args) {
    this.store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    if (args.length >= 2 && (args[0] === 'EX' || args[0] === 'ex')) {
      const seconds = Number(args[1]);
      this.expirations.set(key, Date.now() + seconds * 1000);
    }
    return 'OK';
  }

  async setex(key, seconds, value) {
    this.store.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    this.expirations.set(key, Date.now() + seconds * 1000);
    return 'OK';
  }

  async del(key) {
    const existed = this.store.delete(key);
    this.expirations.delete(key);
    return existed ? 1 : 0;
  }

  async expire(key, seconds) {
    if (this.store.has(key)) {
      this.expirations.set(key, Date.now() + seconds * 1000);
      return 1;
    }
    return 0;
  }

  async keys(pattern) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    const matches = [];
    for (const key of this.store.keys()) {
      if (!this._isExpired(key) && regex.test(key)) {
        matches.push(key);
      }
    }
    return matches;
  }

  async flushall() {
    this.store.clear();
    this.expirations.clear();
    return 'OK';
  }

  on(event, handler) {
    // Mock event listener
    return this;
  }
}

let redisClient;

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  try {
    const client = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: () => null, // Do not endlessly retry if offline
      lazyConnect: true
    });

    client.on('error', (err) => {
      // Handled silently
    });

    client.connect()
      .then(() => {
        console.log(`[Redis] Connected to Redis server at ${redisUrl}`);
        redisClient = client;
      })
      .catch((err) => {
        console.warn(`[Redis] Redis server not reachable at ${redisUrl} (${err.message}). Using In-Memory Redis fallback.`);
        redisClient = new InMemoryRedisFallback();
      });

    // Default to fallback until verified
    redisClient = new InMemoryRedisFallback();
  } catch (error) {
    console.warn(`[Redis] Error initializing Redis client. Using In-Memory fallback.`);
    redisClient = new InMemoryRedisFallback();
  }
};

initRedis();

export default redisClient;

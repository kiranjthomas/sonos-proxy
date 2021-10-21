import Redis from "ioredis";

class RedisClient {
  public readonly client: Redis.Redis = new Redis({ host: "redis" });
  static instance: RedisClient;
  constructor() {
    if (RedisClient.instance === null) {
      RedisClient.instance = this;
    }
    return RedisClient.instance;
  }
}

const redisClient = new RedisClient();
Object.freeze(redisClient);

export default redisClient.client;

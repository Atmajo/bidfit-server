import { config } from "dotenv";
config();

const sanitizeRedisUrl = (url: string) => url.replace(/^(redis\:\/\/)/, "");

const { REDIS_ENDPOINT_URI, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, PORT } =
  process.env;

export const envs = {
  redis: {
    endpointUri: REDIS_ENDPOINT_URI
      ? sanitizeRedisUrl(REDIS_ENDPOINT_URI)
      : `${sanitizeRedisUrl(REDIS_HOST!)}:${REDIS_PORT}`,
    host: REDIS_HOST || "127.0.0.1",
    port: REDIS_PORT || 6379,
    password: REDIS_PASSWORD || undefined,
    upstash: process.env.UPSTASH_URI!
  },
  app: {
    port: PORT || 3000,
  },
  jwtsecret: process.env.JWT_SECRET!
};

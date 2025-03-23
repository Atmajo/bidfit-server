import { createClient } from "redis";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { envs } from "../config";

const { endpointUri, password, upstash } = envs.redis;

const redisClient = createClient({
  url: upstash,
});

redisClient.on("error", function (err) {
  throw err;
});
redisClient.connect();

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  max: 30,
  windowMs: 10 * 60 * 1000,
});

export default limiter;

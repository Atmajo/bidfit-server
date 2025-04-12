import { createClient } from "redis";
import { envs } from "../config";

const { endpointUri, password } = envs.redis;

export const redisClient = createClient({
  url: `redis://${endpointUri}`,
  password: password,
});

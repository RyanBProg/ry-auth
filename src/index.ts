import { AuthService } from "./auth";
import { MemoryUserAdapter } from "./memory-adapter";
import { HashingService } from "./hashing";
import { TokenService } from "./tokens";
import { CookieService } from "./cookies";
import type { NodeEnv } from "./types/cookies";

export function createAuth(options: {
  userAdapter: MemoryUserAdapter;
  jwtAccessTokenSecret: string;
  jwtRefreshTokenSecret: string;
  nodeEnv: NodeEnv;
  domain?: string;
}) {
  if (options.nodeEnv === "prod" && !options.domain) {
    throw new Error("domain is required when nodeEnv is 'prod'");
  }

  const users = options.userAdapter;
  const hashing = new HashingService();
  const tokens = new TokenService(
    options.jwtAccessTokenSecret,
    options.jwtRefreshTokenSecret
  );
  const cookies = new CookieService();

  return new AuthService(
    users,
    hashing,
    tokens,
    cookies,
    options.nodeEnv,
    options.domain || ""
  );
}

export * from "./adapter";
export * from "./types/user";
export * from "./cookies";
export { CookieService } from "./cookies";
export { HashingService } from "./hashing";
export { TokenService } from "./tokens";
export { AuthService } from "./auth";

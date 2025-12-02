import { AuthService } from "./auth";
import { HashingService } from "./hashing";
import { TokenService } from "./tokens";
import { CookieService } from "./cookies";
import type { CreateAuthConfig } from "./types/createAuth";

export function createAuth(authConfig: CreateAuthConfig) {
  if (
    authConfig.config.nodeEnv === "production" &&
    !authConfig.cookies.domain
  ) {
    throw new Error("domain is required when nodeEnv is 'prod'");
  }

  const users = authConfig.adapters.userAdapters;
  const hashing = new HashingService();
  const tokens = new TokenService(
    authConfig.jwt.jwtAccessTokenSecret,
    authConfig.jwt.jwtRefreshTokenSecret
  );
  const cookies = new CookieService();

  return new AuthService(
    users,
    hashing,
    tokens,
    cookies,
    authConfig.config.nodeEnv,
    authConfig.cookies.domain || ""
  );
}

export * from "./adapter";
export * from "./types/user";
export * from "./cookies";
export { CookieService } from "./cookies";
export { HashingService } from "./hashing";
export { TokenService } from "./tokens";
export { AuthService } from "./auth";

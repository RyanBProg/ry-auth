import { AuthService } from "./auth";
import { MemoryUserAdapter } from "./memory-adapter";
import { HashingService } from "./hashing";
import { TokenService } from "./tokens";
import { CookieService } from "./cookies";

export function createAuth(options: {
  userAdapter?: MemoryUserAdapter;
  jwtSecret: string;
}) {
  const users = options.userAdapter ?? new MemoryUserAdapter();
  const hashing = new HashingService();
  const tokens = new TokenService(options.jwtSecret);
  const cookies = new CookieService();

  return new AuthService(users, hashing, tokens, cookies);
}

export * from "./adapter";
export * from "./types";
export * from "./cookies";
export { CookieService } from "./cookies";
export { HeadersService } from "./headers";
export { HashingService } from "./hashing";
export { TokenService } from "./tokens";
export { AuthService } from "./auth";

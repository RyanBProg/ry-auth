import { SignJWT, jwtVerify } from "jose";
import type { AuthTokenPayload } from "./types/tokens";

export class TokenService {
  private readonly accessSecretKey: Uint8Array;
  private readonly refreshSecretKey: Uint8Array;

  constructor(accessSecret: string, refreshSecret: string) {
    this.accessSecretKey = new TextEncoder().encode(accessSecret);
    this.refreshSecretKey = new TextEncoder().encode(refreshSecret);
  }

  async createAccessToken(payload: AuthTokenPayload, expiresInMinutes = 15) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInMinutes * 60)
      .sign(this.accessSecretKey);
  }

  async createRefreshToken(payload: AuthTokenPayload, expiresInDays = 3) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(
        Math.floor(Date.now() / 1000) + expiresInDays * 60 * 60 * 24
      )
      .sign(this.refreshSecretKey);
  }

  async verifyAccessToken(token: string) {
    const { payload } = await jwtVerify(token, this.accessSecretKey);
    return payload;
  }

  async verifyRefreshToken(token: string) {
    const { payload } = await jwtVerify(token, this.refreshSecretKey);
    return payload;
  }
}

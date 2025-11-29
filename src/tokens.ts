import { type JWTPayload, SignJWT, jwtVerify } from "jose";

export class TokenService {
  private secretKey: Uint8Array;

  constructor(secret: string) {
    this.secretKey = new TextEncoder().encode(secret);
  }

  async createAccessToken(payload: JWTPayload, expiresInSeconds = 60 * 60) {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
      .sign(this.secretKey);
  }

  async verifyToken(token: string) {
    const { payload } = await jwtVerify(token, this.secretKey);
    return payload;
  }
}

import { type UserAdapter } from "./adapter";
import { HashingService } from "./hashing";
import { TokenService } from "./tokens";
import { CookieService } from "./cookies";
import { type NodeEnv, type Request, type Response } from "./types/cookies";
import type { AuthTokenPayload } from "./types/tokens";

export class AuthService {
  constructor(
    private users: UserAdapter,
    private hashing: HashingService,
    private token: TokenService,
    private cookies: CookieService,
    private readonly nodeEnv: NodeEnv,
    private domain: string
  ) {}

  async register(email: string, password: string, res?: Response) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await this.hashing.hashPassword(password);

    const user = await this.users.createUser({ email, hashedPassword });
    const accessToken = await this.token.createAccessToken({ id: user.id }, 15);
    const refreshToken = await this.token.createRefreshToken(
      { id: user.id },
      3
    );

    if (res) {
      await this.cookies.setCookie(res, "accessToken", accessToken, {
        secure: this.nodeEnv === "prod",
        httpOnly: true,
        sameSite: this.nodeEnv === "prod" ? "none" : "lax",
        domain: this.nodeEnv === "prod" ? this.domain : undefined,
        path: "/",
        maxAge: 60 * 15,
      });

      await this.cookies.setCookie(res, "refreshToken", refreshToken, {
        secure: this.nodeEnv === "prod",
        httpOnly: true,
        sameSite: this.nodeEnv === "prod" ? "none" : "lax",
        domain: this.nodeEnv === "prod" ? this.domain : undefined,
        path: "/",
        maxAge: 60 * 60 * 24 * 3,
      });
    }

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string, res?: Response) {
    const existing = await this.users.findByEmail(email);
    if (!existing) throw new Error("No user found");

    const isPasswordMatch = await this.hashing.verifyPassword(
      password,
      existing.hashedPassword
    );

    if (!isPasswordMatch) {
      throw new Error("Incorrect Password");
    }

    const accessToken = await this.token.createAccessToken(
      { id: existing.id },
      15
    );
    const refreshToken = await this.token.createRefreshToken(
      { id: existing.id },
      3
    );

    if (res) {
      await this.cookies.setCookie(res, "accessToken", accessToken, {
        secure: this.nodeEnv === "prod",
        httpOnly: true,
        sameSite: this.nodeEnv === "prod" ? "none" : "lax",
        domain: this.nodeEnv === "prod" ? this.domain : undefined,
        path: "/",
        maxAge: 60 * 15,
      });

      await this.cookies.setCookie(res, "refreshToken", refreshToken, {
        secure: this.nodeEnv === "prod",
        httpOnly: true,
        sameSite: this.nodeEnv === "prod" ? "none" : "lax",
        domain: this.nodeEnv === "prod" ? this.domain : undefined,
        path: "/",
        maxAge: 60 * 60 * 24 * 3,
      });
    }

    return { accessToken, refreshToken };
  }

  async logout(res: Response) {
    await this.cookies.setCookie(res, "accessToken", "", {
      secure: this.nodeEnv === "prod",
      httpOnly: true,
      sameSite: this.nodeEnv === "prod" ? "none" : "lax",
      domain: this.nodeEnv === "prod" ? this.domain : undefined,
      path: "/",
      maxAge: 0,
    });

    await this.cookies.setCookie(res, "refreshToken", "", {
      secure: this.nodeEnv === "prod",
      httpOnly: true,
      sameSite: this.nodeEnv === "prod" ? "none" : "lax",
      domain: this.nodeEnv === "prod" ? this.domain : undefined,
      path: "/",
      maxAge: 0,
    });
  }

  async isAuth(req: Request) {
    const accessToken = await this.cookies.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new Error("No access token found");
    }

    try {
      const payload = await this.token.verifyAccessToken(accessToken);
      return {
        isValid: true,
        userId: payload.id,
      };
    } catch {
      return {
        isValid: false,
        userId: null,
      };
    }
  }

  async refreshAccessToken(req: Request, res: Response) {
    const refreshToken = await this.cookies.getCookie(req, "refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    try {
      const payload = (await this.token.verifyRefreshToken(
        refreshToken
      )) as AuthTokenPayload;
      const newAccessToken = await this.token.createAccessToken(
        { id: payload.id },
        15
      );

      await this.cookies.setCookie(res, "accessToken", newAccessToken, {
        secure: this.nodeEnv === "prod",
        httpOnly: true,
        sameSite: this.nodeEnv === "prod" ? "none" : "lax",
        domain: this.nodeEnv === "prod" ? this.domain : undefined,
        path: "/",
        maxAge: 60 * 15,
      });

      return { accessToken: newAccessToken };
    } catch {
      throw new Error("Invalid or expired refresh token");
    }
  }
}

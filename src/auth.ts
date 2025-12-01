import { type UserAdapter } from "./adapter";
import { HashingService } from "./hashing";
import { TokenService } from "./tokens";
import { CookieService, type Request, type Response } from "./cookies";

export class AuthService {
  constructor(
    private users: UserAdapter,
    private hashing: HashingService,
    private token: TokenService,
    private cookies: CookieService
  ) {}

  async register(email: string, password: string, res?: Response) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await this.hashing.hashPassword(password);

    const user = await this.users.createUser({ email, hashedPassword });
    const accessToken = await this.token.createAccessToken({ id: user.id });
    const refreshToken = await this.token.createAccessToken(
      { id: user.id },
      60 * 60 * 24 * 7 // 7 days
    );

    if (res) {
      await this.cookies.setCookie(res, "refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 60 * 60 * 24 * 7,
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

    const accessToken = await this.token.createAccessToken({ id: existing.id });
    const refreshToken = await this.token.createAccessToken(
      { id: existing.id },
      60 * 60 * 24 * 7 // 7 days
    );

    if (res) {
      await this.cookies.setCookie(res, "refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return { accessToken, refreshToken };
  }

  async logout(res: Response) {
    // Clear the refresh token cookie
    await this.cookies.setCookie(res, "refreshToken", "", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 0, // Expire immediately
    });
  }

  async isAuth(token: string) {
    try {
      const payload = await this.token.verifyToken(token);
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

  async refreshToken(req: Request, res: Response) {
    const refreshToken = await this.cookies.getCookie(req, "refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    try {
      const payload = await this.token.verifyToken(refreshToken);

      // Create new access token
      const newAccessToken = await this.token.createAccessToken(
        { id: payload.id },
        60 * 60 // 1 hour
      );

      // Optionally create a new refresh token
      const newRefreshToken = await this.token.createAccessToken(
        { id: payload.id },
        60 * 60 * 24 * 7 // 7 days
      );

      // Update the refresh token cookie
      await this.cookies.setCookie(res, "refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 60 * 60 * 24 * 7,
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new Error("Invalid or expired refresh token");
    }
  }
}

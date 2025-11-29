import { type UserAdapter } from "./adapter";
import { HashingService } from "./hashing";
import { TokenService } from "./tokens";

export class AuthService {
  constructor(
    private users: UserAdapter,
    private hashing: HashingService,
    private token: TokenService
  ) {}

  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await this.hashing.hashPassword(password);

    const user = await this.users.createUser({ email, hashedPassword });
    const authToken = await this.token.createAccessToken({ id: user.id });
    return { accessToken: authToken };
  }

  async login(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (!existing) throw new Error("No user found");

    const isPasswordMatch = await this.hashing.verifyPassword(
      password,
      existing.hashedPassword
    );

    if (!isPasswordMatch) {
      throw new Error("Incorrect Password");
    }

    const authToken = await this.token.createAccessToken({ id: existing.id });
    return { accessToken: authToken };
  }

  async logout() {
    // delete jwt
  }

  async isAuth(token: string) {}

  async refreshToken() {
    // check jwt
    // return fresh jwt
  }
}

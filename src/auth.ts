export class AuthService {
  constructor(private users: UserAdapter, private hashing: HashingService) {}

  async register(email: string, password: string) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new Error("Email already in use");

    const password = await this.hashing.hashpassword(password);

    const user = await this.users.createUser({ email, password });
    return user;
    // create user
    // create jwt
    // return jwt
  }

  async login(email: string, password: string) {
    // find user
    // check password
    // create jwt
    // return jwt
  }

  async logout() {
    // delete jwt
  }

  async isAuth() {
    // check jwt
  }

  async refreshToken() {
    // check jwt
    // return fresh jwt
  }
}

import { type User } from "./types";
import { type UserAdapter } from "./adapter";

export class MemoryUserAdapter implements UserAdapter {
  private users: User[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) || null;
  }

  async createUser(data: Omit<User, "id">): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      ...data,
    };

    this.users.push(user);
    return user;
  }
}

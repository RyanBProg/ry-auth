import { type User } from "./types";

export interface UserAdapter {
  findByEmail(email: string): Promise<User | null>;
  createUser(user: Omit<User, "id">): Promise<User>;
}
